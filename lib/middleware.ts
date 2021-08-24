import http from "http";
import { join, extname } from "path";
import chokidar from "chokidar";
import { createReadStream } from "fs-extra";
import mime from "mime-types";
import socket from "socket.io";
import { Config } from "./config";
import { Renderer } from "./renderer";
import { attachSocketClient } from "./helpers/attachSocketClient";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
import { tryResolveFilePath } from "./helpers/tryResolveFilePath";

export interface TexaServerMiddlewareEvents extends TexaEventSkeleton {
    refresh: (cause: string, path: string) => void;
    request: (url: string) => void;
}

export interface TexaServerMiddlewareOptions {
    hotReload: boolean;
    server: http.Server;
    chokidar: chokidar.FSWatcher;
    socket: socket.Server;
}

export class TexaServerMiddleware extends TexaEventEmitter<TexaServerMiddlewareEvents> {
    config: Config;
    options: Partial<TexaServerMiddlewareOptions>;

    constructor(
        config: Config,
        options: Partial<TexaServerMiddlewareOptions> = {
            hotReload: false,
        }
    ) {
        super();

        this.config = config;
        this.options = options;

        if (this.options.hotReload) {
            if (!this.options.server) {
                throw new Error(
                    "'options.server' is required in 'hotReload' mode"
                );
            }

            if (!this.options.chokidar) {
                this.options.chokidar = chokidar.watch(this.config.root);
            }

            if (!this.options.socket) {
                this.options.socket = new socket.Server(this.options.server);
            }

            this.options.chokidar!.on("ready", () => {
                this.options.chokidar!.on("all", (event, path) => {
                    this.options.socket!.emit("refresh");
                    this.dispatch("refresh", event, path);
                });
            });
        }
    }

    async handle(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<boolean> {
        if (req.url) {
            let _cPath = join(this.config.contents, req.url),
                _cExt = extname(_cPath);

            if ([".html", ".md"].includes(_cExt)) {
                _cPath = _cPath.slice(0, -_cExt.length);
            }

            const path = await tryResolveFilePath(
                _cPath,
                [".html", ".md"],
                ["index"]
            );

            if (path) {
                const ext = extname(path);
                let html: string | undefined;

                switch (ext) {
                    case ".md":
                        html = await Renderer.md(path, this.config, {});
                        break;

                    case ".html":
                        html = await Renderer.html(path, this.config, {});
                        break;

                    default:
                        break;
                }

                if (html) {
                    this.dispatch("request", req.url);

                    res.writeHead(200, {
                        "Content-Type": "text/html; charset=utf-8",
                    }).end(attachSocketClient(html));

                    return true;
                }
            }

            const staticPath = await tryResolveFilePath(
                join(this.config.public, req.url),
                [".html"],
                ["index"]
            );
            if (staticPath) {
                res.writeHead(200, {
                    "Content-Type":
                        mime.lookup(extname(staticPath)) ||
                        "application/octet-stream",
                });

                createReadStream(staticPath).pipe(res);
                return true;
            }
        }

        return false;
    }
}

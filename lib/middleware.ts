import http from "http";
import { join, extname } from "path";
import chokidar from "chokidar";
import fs from "fs-extra";
import mime from "mime-types";
import socket from "socket.io";
import { Config } from "./config";
import { Renderer } from "./renderer";
import { attackSocketClient } from "./helpers/attackSocketClient";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
import { fileExists } from "./helpers/fileExists";

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

            this.options.chokidar!.on("all", (event, path) => {
                this.options.socket!.emit("refresh");
                this.dispatch("refresh", event, path);
            });
        }
    }

    async handle(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<boolean> {
        if (req.url) {
            let path = join(this.config.contents, req.url.slice(1));
            if (!extname(path)) {
                path += this.config.defaultLayoutsExtension;
            }

            const mded = path.replace(/\.html$/, ".md");
            if (await fileExists(mded)) {
                path = mded;
            }

            let exists = await fileExists(path);
            if (exists) {
                const ext = extname(path);
                let html: string | undefined;
                if (ext === ".md") {
                    html = await Renderer.md(path, this.config, {});
                } else if (ext === ".html") {
                    html = await Renderer.html(path, this.config, {});
                }

                if (html) {
                    this.dispatch("request", req.url);

                    res.writeHead(200, {
                        "Content-Type": "text/html; charset=utf-8",
                    }).end(attackSocketClient(html));

                    return true;
                }
            }

            path = path.replace(this.config.contents, this.config.public);
            exists = await fileExists(path);
            if (exists) {
                res.writeHead(200, {
                    "Content-Type":
                        mime.lookup(extname(path)) ||
                        "application/octet-stream",
                });

                fs.createReadStream(path).pipe(res);
                return true;
            }
        }

        return false;
    }
}

import http from "http";
import { join, extname } from "path";
import chokidar from "chokidar";
import express from "express";
import socket from "socket.io";
import { Config } from "./config";
import { Renderer } from "./renderer";
import { attackSocketClient } from "./helpers/attackSocketClient";
import { fileExists } from "./helpers/fileExists";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";

export interface TexaEvents extends TexaEventSkeleton {
    started: (url: string) => void;
    refresh: (cause: string, path: string) => void;
    request: (url: string) => void;
}

export class TexaServer extends TexaEventEmitter<TexaEvents> {
    config: Config;
    http: http.Server;
    express: express.Application;
    socket: socket.Server;
    chokidar: chokidar.FSWatcher;

    constructor(config: Config) {
        super();

        this.config = config;
        this.express = express();
        this.http = http.createServer(this.express);
        this.socket = new socket.Server(this.http);
        this.chokidar = chokidar.watch(this.config.root);

        this._attach();
    }

    private _attach(): void {
        this.chokidar.on("all", (event, path) => {
            this.socket.emit("refresh");
            this.dispatch("refresh", event, path);
        });

        this.express.get("*", async (req, res) => {
            this.dispatch("request", req.url);

            const path = join(this.config.contents, req.path.slice(1)).replace(
                /\.html$/,
                ".md"
            );
            const exists = await fileExists(path);
            if (!exists) {
                return res.status(400).send(`Path not a file: ${path}`);
            }

            const ext = extname(path);
            let html: string | undefined;
            if (ext === ".md") {
                html = await Renderer.md(path, this.config, {});
            } else if (ext === ".html") {
                html = await Renderer.html(path, this.config, {});
            }

            if (html) {
                return res
                    .header("Content-Type", "text/html; charset=utf-8")
                    .status(200)
                    .send(attackSocketClient(html));
            }

            return res.sendFile(path);
        });
    }

    async start(): Promise<string> {
        return new Promise((resolve) => {
            this.http.listen(
                this.config.server.port,
                this.config.server.host,
                () => {
                    const url = `http://${this.config.server.host}:${this.config.server.port}`;
                    this.dispatch("started", url);
                    resolve(url);
                }
            );
        });
    }
}

export const dev = async (config: Config): Promise<TexaServer> => {
    const server = new TexaServer(config);

    server.subscribe("started", (url) => {
        console.log(`Serving at ${url}`);
    });

    server.subscribe("request", (url) => {
        console.log(`Requested ${url}`);
    });

    server.subscribe("refresh", (cause, path) => {
        console.log(`Refreshing due to ${cause} on ${path}`);
    });

    await server.start();
    return server;
};

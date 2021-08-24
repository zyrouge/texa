import fs from "fs";
import http from "http";
import { extname, join } from "path";
import mime from "mime-types";
import config from "./config";
import { TexaServerMiddleware } from "../lib/middleware";
import { fileExists } from "../lib/helpers/fileExists";

const HOST = "localhost",
    PORT = 6500;

const start = async () => {
    const server = http.createServer();

    const middleware = new TexaServerMiddleware(config, {
        hotReload: true,
        server: server,
    });

    server.on("request", async (req, res) => {
        if (
            req.url?.startsWith("/socket.io") ||
            (await middleware.handle(req, res))
        )
            return;

        if (req.url) {
            const path = join(config.root, req.url.slice(1));
            if (await fileExists(path)) {
                res.writeHead(200, {
                    "Content-Type":
                        mime.lookup(extname(path)) ||
                        "application/octet-stream",
                });

                return fs.createReadStream(path).pipe(res);
            }

            return res.writeHead(404).end("Unknown route");
        }

        return res.writeHead(500).end("Unknown url");
    });

    middleware.subscribe("request", (path) => {
        console.log(`Server request: ${path}`);
    });

    middleware.subscribe("refresh", (cause, path) => {
        console.log(`Reloaded due to '${cause}' on '${path}'`);
    });

    server.listen(PORT, HOST, () => {
        console.log(`Serving at http://${HOST}:${PORT}`);
    });
};

start();

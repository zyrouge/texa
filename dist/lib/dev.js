"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = exports.TexaServer = void 0;
const http_1 = __importDefault(require("http"));
const path_1 = require("path");
const chokidar_1 = __importDefault(require("chokidar"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const renderer_1 = require("./renderer");
const attackSocketClient_1 = require("./helpers/attackSocketClient");
const fileExists_1 = require("./helpers/fileExists");
const eventer_1 = require("./helpers/eventer");
class TexaServer extends eventer_1.TexaEventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.express = express_1.default();
        this.http = http_1.default.createServer(this.express);
        this.socket = new socket_io_1.default.Server(this.http);
        this.chokidar = chokidar_1.default.watch(this.config.root);
        this._attach();
    }
    _attach() {
        this.chokidar.on("all", (event, path) => {
            this.socket.emit("refresh");
            this.dispatch("refresh", event, path);
        });
        this.express.get("*", (req, res) => __awaiter(this, void 0, void 0, function* () {
            this.dispatch("request", req.url);
            const path = path_1.join(this.config.contents, req.path.slice(1)).replace(/\.html$/, ".md");
            const exists = yield fileExists_1.fileExists(path);
            if (!exists) {
                return res.status(400).send(`Path not a file: ${path}`);
            }
            const ext = path_1.extname(path);
            let html;
            if (ext === ".md") {
                html = yield renderer_1.Renderer.md(path, this.config, {});
            }
            else if (ext === ".html") {
                html = yield renderer_1.Renderer.html(path, this.config, {});
            }
            if (html) {
                return res
                    .header("Content-Type", "text/html; charset=utf-8")
                    .status(200)
                    .send(attackSocketClient_1.attackSocketClient(html));
            }
            return res.sendFile(path);
        }));
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.http.listen(this.config.server.port, this.config.server.host, () => {
                    const url = `http://${this.config.server.host}:${this.config.server.port}`;
                    this.dispatch("started", url);
                    resolve(url);
                });
            });
        });
    }
}
exports.TexaServer = TexaServer;
const dev = (config) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield server.start();
    return server;
});
exports.dev = dev;

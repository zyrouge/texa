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
exports.TexaServerMiddleware = void 0;
const path_1 = require("path");
const chokidar_1 = __importDefault(require("chokidar"));
const socket_io_1 = __importDefault(require("socket.io"));
const renderer_1 = require("./renderer");
const attackSocketClient_1 = require("./helpers/attackSocketClient");
const eventer_1 = require("./helpers/eventer");
const fileExists_1 = require("./helpers/fileExists");
class TexaServerMiddleware extends eventer_1.TexaEventEmitter {
    constructor(config, options = {
        hotReload: false,
    }) {
        super();
        this.config = config;
        this.options = options;
        if (this.options.hotReload) {
            if (!this.options.server) {
                throw new Error("'options.server' is required in 'hotReload' mode");
            }
            if (!this.options.chokidar) {
                this.options.chokidar = chokidar_1.default.watch(this.config.root);
            }
            if (!this.options.socket) {
                this.options.socket = new socket_io_1.default.Server(this.options.server);
            }
            this.options.chokidar.on("all", (event, path) => {
                this.options.socket.emit("refresh");
                this.dispatch("refresh", event, path);
            });
        }
    }
    createMiddleware() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (req.url) {
                this.dispatch("request", req.url);
                const path = path_1.join(this.config.contents, req.url.slice(1)).replace(/\.html$/, ".md");
                const exists = yield fileExists_1.fileExists(path);
                if (exists) {
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
                            .writeHead(200, {
                            "Content-Type": "text/html; charset=utf-8",
                        })
                            .end(attackSocketClient_1.attackSocketClient(html));
                    }
                }
            }
            return next();
        });
    }
}
exports.TexaServerMiddleware = TexaServerMiddleware;

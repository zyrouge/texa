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
exports.TexaBuilder = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const renderer_1 = require("./renderer");
const eventer_1 = require("./helpers/eventer");
class TexaBuilder extends eventer_1.TexaEventEmitter {
    constructor(config) {
        super();
        this.config = config;
    }
    file(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dispatch("file", path);
            const ext = path_1.extname(path);
            const out = path.replace(this.config.contents, this.config.outputDir);
            yield fs_extra_1.default.ensureDir(path_1.dirname(out));
            switch (ext) {
                case ".html": {
                    const rendered = yield renderer_1.Renderer.html(path, this.config, {});
                    yield fs_extra_1.default.writeFile(out, rendered);
                    break;
                }
                case ".md": {
                    const rendered = yield renderer_1.Renderer.md(path, this.config, {});
                    yield fs_extra_1.default.writeFile(out.replace(/\.md/, ".html"), rendered);
                    break;
                }
                default:
                    yield fs_extra_1.default.copyFile(path, out);
                    break;
            }
        });
    }
    folder(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dispatch("folder", path);
            for (const name of yield fs_extra_1.default.readdir(path)) {
                const p = path_1.join(path, name);
                const lstat = yield fs_extra_1.default.lstat(p);
                if (lstat.isFile()) {
                    yield this.file(p);
                }
                else {
                    yield this.folder(p);
                }
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.rm(this.config.outputDir, {
                recursive: true,
                force: true,
            });
            yield this.folder(this.config.contents);
        });
    }
}
exports.TexaBuilder = TexaBuilder;

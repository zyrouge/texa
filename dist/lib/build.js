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
exports.build = exports.folder = exports.file = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const renderer_1 = require("./renderer");
const file = (path, config) => __awaiter(void 0, void 0, void 0, function* () {
    const ext = path_1.extname(path);
    const out = path.replace(config.contents, config.outputDir);
    yield fs_extra_1.default.ensureDir(path_1.dirname(out));
    switch (ext) {
        case ".html": {
            const rendered = yield renderer_1.Renderer.html(path, config, {});
            yield fs_extra_1.default.writeFile(out, rendered);
            break;
        }
        case ".md": {
            const rendered = yield renderer_1.Renderer.md(path, config, {});
            yield fs_extra_1.default.writeFile(out.replace(/\.md/, ".html"), rendered);
            break;
        }
        default:
            yield fs_extra_1.default.copyFile(path, out);
            break;
    }
});
exports.file = file;
const folder = (path, config) => __awaiter(void 0, void 0, void 0, function* () {
    for (const name of yield fs_extra_1.default.readdir(path)) {
        const p = path_1.join(path, name);
        const lstat = yield fs_extra_1.default.lstat(p);
        if (lstat.isFile()) {
            yield exports.file(p, config);
        }
        else {
            yield exports.folder(p, config);
        }
    }
});
exports.folder = folder;
const build = (config) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.rm(config.outputDir, {
        recursive: true,
        force: true,
    });
    yield exports.folder(config.contents, config);
});
exports.build = build;

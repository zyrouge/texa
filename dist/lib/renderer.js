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
exports.Renderer = void 0;
const path_1 = require("path");
const ejs_1 = __importDefault(require("ejs"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const marked_1 = __importDefault(require("marked"));
const fileExists_1 = require("./helpers/fileExists");
class Renderer {
    static html(path, config, data) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.assign(data, config.define);
            let html = yield ejs_1.default.renderFile(path, data, {
                root: config.root,
            });
            if (config.hooks.transformHtml) {
                html = yield config.hooks.transformHtml(html);
            }
            return html;
        });
    }
    static md(path, config, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const rendered = yield this.html(path, config, data);
            const parsed = gray_matter_1.default(rendered);
            const md = marked_1.default(parsed.content);
            Object.assign(data, {
                content: md,
                meta: parsed.data,
            });
            if (typeof parsed.data.layout != "string") {
                throw new Error(`Missing or invalid 'layout' in '${path}'`);
            }
            let layout = path_1.isAbsolute(parsed.data.layout)
                ? parsed.data.layout
                : path_1.join(config.layouts, parsed.data.layout);
            if (!path_1.extname(layout)) {
                layout += config.defaultLayoutsExtension;
            }
            if (!(yield fileExists_1.fileExists(layout))) {
                throw new Error(`Unknown layout '${layout}' in '${path}'`);
            }
            return this.html(layout, config, data);
        });
    }
}
exports.Renderer = Renderer;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfig = exports.defineConfig = exports.defaultConfig = void 0;
const path_1 = require("path");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
exports.defaultConfig = {
    base: "/",
    root: "./",
    public: "./public",
    layouts: "./layouts",
    contents: "./contents",
    define: {},
    defaultLayoutsExtension: ".html",
    outputDir: "./dist",
    server: {
        host: "localhost",
        port: 6500,
    },
    hooks: {},
};
const defineConfig = (config) => {
    return exports.resolveConfig(lodash_merge_1.default(exports.defaultConfig, config));
};
exports.defineConfig = defineConfig;
const resolveConfig = (config) => {
    if (!path_1.isAbsolute(config.root)) {
        config.root = path_1.join(process.cwd(), config.root);
    }
    const pathKeys = [
        "public",
        "layouts",
        "contents",
        "outputDir",
    ];
    for (const key of pathKeys) {
        const path = config[key];
        if (typeof path != "string")
            throw new Error();
        if (!path_1.isAbsolute(path)) {
            // @ts-ignore
            config[key] = path_1.join(config.root, path);
        }
    }
    return config;
};
exports.resolveConfig = resolveConfig;

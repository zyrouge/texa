import { isAbsolute, join } from "path";
import merge from "lodash.merge";

export interface Hooks {
    transformHtml: (html: string) => Promise<string>;
}

export interface Config {
    base: string;
    root: string;
    public: string;
    layouts: string;
    contents: string;
    define: Record<any, any>;
    defaultLayoutsExtension: string;
    outputDir: string;
    server: {
        host: string;
        port: number;
    };
    hooks: Partial<Hooks>;
}

export const defaultConfig: Config = {
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

export const defineConfig = (config: Partial<Config>): Config => {
    return resolveConfig(merge(defaultConfig, config));
};

export const resolveConfig = (config: Config): Config => {
    if (!isAbsolute(config.root)) {
        config.root = join(process.cwd(), config.root);
    }

    const pathKeys: (keyof Config)[] = [
        "public",
        "layouts",
        "contents",
        "outputDir",
    ];
    for (const key of pathKeys) {
        const path = config[key];
        if (typeof path != "string") throw new Error();

        if (!isAbsolute(path)) {
            // @ts-ignore
            config[key] = join(config.root, path);
        }
    }

    return config;
};

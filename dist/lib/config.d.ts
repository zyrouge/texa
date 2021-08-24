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
export declare const defaultConfig: Config;
export declare const defineConfig: (config: Partial<Config>) => Config;
export declare const resolveConfig: (config: Config) => Config;

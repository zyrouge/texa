import { Config } from "./config";
export declare const file: (path: string, config: Config) => Promise<void>;
export declare const folder: (path: string, config: Config) => Promise<void>;
export declare const build: (config: Config) => Promise<void>;

import { Config } from "./config";
export declare type RenderDataParam = Record<any, any>;
export declare type RenderDataHtml = {
    define: Record<any, any>;
} & RenderDataParam;
export declare type RenderDataMd = {
    content: string;
    meta: Record<any, any>;
} & RenderDataHtml;
export declare class Renderer {
    static html(path: string, config: Config, data: RenderDataParam): Promise<string>;
    static md(path: string, config: Config, data: RenderDataParam): Promise<string>;
}

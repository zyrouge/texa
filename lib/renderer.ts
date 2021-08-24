import { isAbsolute, extname, join } from "path";
import ejs from "ejs";
import graymatter from "gray-matter";
import marked from "marked";
import { Config } from "./config";
import { fileExists } from "./helpers/fileExists";

export type RenderDataParam = Record<any, any>;

export type RenderDataHtml = {
    base: string;
    define: Record<any, any>;
} & RenderDataParam;

export type RenderDataMd = {
    content: string;
    meta: Record<any, any>;
} & RenderDataHtml;

export class Renderer {
    static async html(
        path: string,
        config: Config,
        data: RenderDataParam
    ): Promise<string> {
        Object.assign(data, {
            base: config.base,
            ...config.define,
        });

        let html = await ejs.renderFile(path, data as RenderDataHtml, {
            root: config.root,
        });

        if (config.hooks.transformHtml) {
            html = await config.hooks.transformHtml(html);
        }

        return html;
    }

    static async md(
        path: string,
        config: Config,
        data: RenderDataParam
    ): Promise<string> {
        const rendered = await this.html(path, config, data);
        const parsed = graymatter(rendered);
        const md = marked(parsed.content);

        Object.assign(data, {
            content: md,
            meta: parsed.data,
        });

        if (typeof parsed.data.layout != "string") {
            throw new Error(`Missing or invalid 'layout' in '${path}'`);
        }

        let layout = isAbsolute(parsed.data.layout)
            ? parsed.data.layout
            : join(config.layouts, parsed.data.layout);

        if (!extname(layout)) {
            layout += config.defaultLayoutsExtension;
        }

        if (!(await fileExists(layout))) {
            throw new Error(`Unknown layout '${layout}' in '${path}'`);
        }

        return this.html(layout, config, data as RenderDataMd);
    }
}

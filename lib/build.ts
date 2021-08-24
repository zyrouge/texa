import fs from "fs-extra";
import { dirname, join, extname } from "path";
import { Config } from "./config";
import { Renderer } from "./renderer";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";

export interface TexaBuilderEvents extends TexaEventSkeleton {
    folder: (path: string) => void;
    file: (path: string) => void;
}

export class TexaBuilder extends TexaEventEmitter<TexaBuilderEvents> {
    config: Config;

    constructor(config: Config) {
        super();

        this.config = config;
    }

    async file(path: string): Promise<void> {
        this.dispatch("file", path);

        const ext = extname(path);
        const out = path.replace(this.config.contents, this.config.outputDir);

        await fs.ensureDir(dirname(out));
        switch (ext) {
            case ".html": {
                const rendered = await Renderer.html(path, this.config, {});
                await fs.writeFile(out, rendered);
                break;
            }

            case ".md": {
                const rendered = await Renderer.md(path, this.config, {});
                await fs.writeFile(out.replace(/\.md/, ".html"), rendered);
                break;
            }

            default:
                await fs.copyFile(path, out);
                break;
        }
    }

    async folder(path: string): Promise<void> {
        this.dispatch("folder", path);

        for (const name of await fs.readdir(path)) {
            const p = join(path, name);
            const lstat = await fs.lstat(p);

            if (lstat.isFile()) {
                await this.file(p);
            } else {
                await this.folder(p);
            }
        }
    }

    async start(): Promise<void> {
        await fs.rm(this.config.outputDir, {
            recursive: true,
            force: true,
        });

        await this.folder(this.config.contents);
        await this.folder(this.config.public);
    }
}

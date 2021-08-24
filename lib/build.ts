import { copyFile, ensureDir, writeFile, rm } from "fs-extra";
import { dirname, extname } from "path";
import { Config } from "./config";
import { Renderer } from "./renderer";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
import { filesIn } from "./helpers/filesIn";

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

    async _build(path: string): Promise<void> {
        const ext = extname(path);
        const out = path.replace(this.config.contents, this.config.outputDir);

        await ensureDir(dirname(out));
        switch (ext) {
            case ".html": {
                const rendered = await Renderer.html(path, this.config, {});
                await writeFile(out, rendered);
                break;
            }

            case ".md": {
                const rendered = await Renderer.md(path, this.config, {});
                await writeFile(out.replace(/\.md/, ".html"), rendered);
                break;
            }

            default:
                await copyFile(path, out);
                break;
        }
    }

    async start(): Promise<void> {
        await rm(this.config.outputDir, {
            recursive: true,
            force: true,
        });

        for (const file of await filesIn(this.config.contents)) {
            this.dispatch("file", file);
            await this._build(file);
        }

        for (const file of await filesIn(this.config.public)) {
            this.dispatch("file", file);
            const out = file.replace(this.config.public, this.config.outputDir);
            await ensureDir(dirname(out));
            await copyFile(file, out);
        }
    }
}

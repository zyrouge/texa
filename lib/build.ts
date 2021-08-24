import fs from "fs-extra";
import { dirname, join, extname } from "path";
import { Config } from "./config";
import { Renderer } from "./renderer";

export const file = async (path: string, config: Config): Promise<void> => {
    const ext = extname(path);
    const out = path.replace(config.contents, config.outputDir);

    await fs.ensureDir(dirname(out));
    switch (ext) {
        case ".html": {
            const rendered = await Renderer.html(path, config, {});
            await fs.writeFile(out, rendered);
            break;
        }

        case ".md": {
            const rendered = await Renderer.md(path, config, {});
            await fs.writeFile(out.replace(/\.md/, ".html"), rendered);
            break;
        }

        default:
            await fs.copyFile(path, out);
            break;
    }
};

export const folder = async (path: string, config: Config): Promise<void> => {
    for (const name of await fs.readdir(path)) {
        const p = join(path, name);
        const lstat = await fs.lstat(p);

        if (lstat.isFile()) {
            await file(p, config);
        } else {
            await folder(p, config);
        }
    }
};

export const build = async (config: Config): Promise<void> => {
    await fs.rm(config.outputDir, {
        recursive: true,
        force: true,
    });

    await folder(config.contents, config);
};

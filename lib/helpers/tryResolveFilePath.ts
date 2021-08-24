import { join, extname } from "path";
import { fileExists } from "./fileExists";

export const tryResolveFilePath = async (
    path: string,
    extensions: string[],
    filenames: string[]
): Promise<string | undefined> => {
    const paths: string[] = [];

    if (filenames.length && !(await fileExists(path))) {
        paths.push(...filenames.map((x) => join(path, x)));
    } else {
        paths.push(path);
    }

    const ext = extname(path);
    if (!ext) {
        paths.forEach((p) => {
            paths.push(...extensions.map((x) => `${p}${x}`));
        });
    }

    for (const p of paths) {
        if (await fileExists(p)) return p;
    }

    return undefined;
};

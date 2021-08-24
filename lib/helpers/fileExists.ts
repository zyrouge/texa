import { access, constants, stat } from "fs-extra";

export const fileExists = async (path: string): Promise<boolean> =>
    (await access(path, constants.F_OK)
        .then(() => true)
        .catch(() => false)) && (await stat(path)).isFile();

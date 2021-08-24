import { access, constants } from "fs-extra";

export const fileExists = async (path: string): Promise<boolean> =>
    access(path, constants.F_OK)
        .then(() => true)
        .catch(() => false);

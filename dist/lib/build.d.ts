import { Config } from "./config";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
export interface TexaBuilderEvents extends TexaEventSkeleton {
    folder: (path: string) => void;
    file: (path: string) => void;
}
export declare class TexaBuilder extends TexaEventEmitter<TexaBuilderEvents> {
    config: Config;
    constructor(config: Config);
    file(path: string): Promise<void>;
    folder(path: string): Promise<void>;
    start(): Promise<void>;
}

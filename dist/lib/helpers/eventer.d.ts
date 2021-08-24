export declare type TexaEventSubscriber<P = any> = (...param: P[]) => void | Promise<void>;
export interface TexaEventSkeleton {
    [s: string]: TexaEventSubscriber<any>;
}
export declare class TexaEventEmitter<T extends TexaEventSkeleton> {
    private _events;
    subscribe<K extends keyof T>(event: K, listener: T[K]): () => void;
    unsubscribe<K extends keyof T>(event: K, listener: T[K]): void;
    dispatch<K extends keyof T>(event: K, ...param: Parameters<T[K]>): void;
}

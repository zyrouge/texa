export type TexaEventSubscriber<P = any> = (
    ...param: P[]
) => void | Promise<void>;

export interface TexaEventSkeleton {
    [s: string]: TexaEventSubscriber<any>;
}

export class TexaEventEmitter<T extends TexaEventSkeleton> {
    private _events: {
        [e in keyof T]?: T[e][];
    } = {};

    subscribe<K extends keyof T>(event: K, listener: T[K]): () => void {
        if (!this._events[event]) this._events[event] = [];
        this._events[event]!.push(listener);
        return () => this.unsubscribe(event, listener);
    }

    unsubscribe<K extends keyof T>(event: K, listener: T[K]): void {
        this._events[event] = this._events[event]?.filter(
            (x) => x !== listener
        );
    }

    dispatch<K extends keyof T>(event: K, ...param: Parameters<T[K]>): void {
        this._events[event]?.forEach((listener) => listener(...param));
    }
}

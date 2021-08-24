/// <reference types="node" />
import http from "http";
import chokidar from "chokidar";
import socket from "socket.io";
import { Config } from "./config";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
export interface TexaServerMiddlewareEvents extends TexaEventSkeleton {
    refresh: (cause: string, path: string) => void;
    request: (url: string) => void;
}
export interface TexaServerMiddlewareOptions {
    hotReload: boolean;
    server: http.Server;
    chokidar: chokidar.FSWatcher;
    socket: socket.Server;
}
export declare class TexaServerMiddleware extends TexaEventEmitter<TexaServerMiddlewareEvents> {
    config: Config;
    options: Partial<TexaServerMiddlewareOptions>;
    constructor(config: Config, options?: Partial<TexaServerMiddlewareOptions>);
    createMiddleware(): (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void;
}

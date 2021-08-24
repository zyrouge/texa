/// <reference types="node" />
import http from "http";
import chokidar from "chokidar";
import express from "express";
import socket from "socket.io";
import { Config } from "./config";
import { TexaEventEmitter, TexaEventSkeleton } from "./helpers/eventer";
export interface TexaEvents extends TexaEventSkeleton {
    started: (url: string) => void;
    refresh: (cause: string, path: string) => void;
    request: (url: string) => void;
}
export declare class TexaServer extends TexaEventEmitter<TexaEvents> {
    config: Config;
    http: http.Server;
    express: express.Application;
    socket: socket.Server;
    chokidar: chokidar.FSWatcher;
    constructor(config: Config);
    private _attach;
    start(): Promise<string>;
}
export declare const dev: (config: Config) => Promise<TexaServer>;

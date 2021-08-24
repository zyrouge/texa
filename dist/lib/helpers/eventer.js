"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TexaEventEmitter = void 0;
class TexaEventEmitter {
    constructor() {
        this._events = {};
    }
    subscribe(event, listener) {
        if (!this._events[event])
            this._events[event] = [];
        this._events[event].push(listener);
        return () => this.unsubscribe(event, listener);
    }
    unsubscribe(event, listener) {
        var _a;
        this._events[event] = (_a = this._events[event]) === null || _a === void 0 ? void 0 : _a.filter((x) => x !== listener);
    }
    dispatch(event, ...param) {
        var _a;
        (_a = this._events[event]) === null || _a === void 0 ? void 0 : _a.forEach((listener) => listener(...param));
    }
}
exports.TexaEventEmitter = TexaEventEmitter;

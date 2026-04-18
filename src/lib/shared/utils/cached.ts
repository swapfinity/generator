import { Lazy } from "./lazy";

export class Cached<T> {
    private lazy: Lazy<T> | null;

    constructor(private fn: () => T, eager: boolean = false) {
        this.lazy = eager ? new Lazy(fn) : null;
    }

    get(): T {
        return this.lazy ? this.lazy.get() : this.fn();
    }
}

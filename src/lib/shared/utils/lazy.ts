export class Lazy<T> {
    private value: T | undefined;
    private computed = false;

    constructor(private fn: () => T) { }

    get(): T {
        if (!this.computed) {
            this.value = this.fn();
            this.computed = true;
        }
        return this.value as T;
    }
}

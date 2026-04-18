export class LRUCache<K, V> {
    private map = new Map<K, V>();

    constructor(private maxSize = 100) {
        if (maxSize <= 0) {
            throw new Error("maxSize must be > 0");
        }
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) {
            return undefined;
        }

        const value = this.map.get(key)!;

        this.map.delete(key);
        this.map.set(key, value);

        return value;
    }

    set(key: K, value: V) {
        if (this.has(key)) {
            this.map.delete(key);
        } else if (this.size >= this.maxSize) {
            const oldestKey = this.map.keys().next().value;

            if (oldestKey === undefined) {
                throw new Error("LRUCache illegal state: oldestKey is undefined");
            }
            this.map.delete(oldestKey);
        }

        this.map.set(key, value);
    }

    has(key: K) {
        return this.map.has(key);
    }

    clear() {
        this.map.clear();
    }

    get size() {
        return this.map.size;
    }
}

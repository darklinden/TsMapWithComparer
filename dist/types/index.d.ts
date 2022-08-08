export declare class Dictionary<K, V> {
    length: number;
    private _keys;
    private _values;
    comparer: (a: K, b: K) => number;
    constructor(another?: Dictionary<K, V> | (K | V)[][], comparer?: (a: K, b: K) => number);
    fromJSON(jsonObject: any, convertObjs?: boolean): this;
    toJSON(): {
        [key: string]: V;
    };
    entries(): (K | V)[][];
    keys(): K[];
    values(): V[];
    private indexOfKey;
    private compareKey;
    has(key: K): boolean;
    get(key: K, default_value?: V): V;
    deepGet(path: K[]): V;
    set(key: K, value: V): this;
    sortedSet(key: K, value: V, startVal?: number, endVal?: number): this;
    get size(): number;
    clear(): this;
    delete(key: K): boolean;
    deleteAtIndex(index: number): boolean;
    forEach(callbackfn: (value: V, key?: K, index?: number) => void): void;
    map(callbackfn: (value: V, key?: K, index?: number) => any): any[];
    filter(callbackfn: (value: V, key?: K, index?: number) => Boolean): this;
    clone(): Dictionary<K, V>;
}

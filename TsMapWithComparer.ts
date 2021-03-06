// change from https://github.com/only-cliches/typescript-map

export class Dictionary<K, V> {

    public length: number;

    /**
     * Used to hold an array of keys in the map
     * 
     * @internal
     * @type {Array<K>}
     * @memberOf TSMap
     */
    private _keys: K[];

    /**
     * Used to hold an array of values in the map
     * 
     * @internal
     * @type {Array<V>}
     * @memberOf TSMap
     */
    private _values: V[];

    public comparer: (a: K, b: K) => number = null;

    constructor(another?: Dictionary<K, V>) {
        let t = this;

        t._keys = [];
        t._values = [];
        t.length = 0;

        if (another) {
            another.entries().forEach((v, k) => {
                t.set(v[0] as K, v[1] as V);
            });
        }
    }

    /**
     * Convert a JSON object to a map.
     * 
     * @param {*} jsonObject JSON object to convert
     * @param {boolean} [convertObjs] convert nested objects to maps
     * @returns {Dictionary<K, V>} 
     * @memberof TSMap
     */
    public fromJSON(jsonObject: any, convertObjs?: boolean): this {
        let t = this;

        const setProperty = (value: any): any => {
            if (value !== null && typeof value === 'object' && convertObjs) return new Dictionary<any, any>().fromJSON(value, true);
            if (Array.isArray(value) && convertObjs) return value.map(v => setProperty(v));
            return value;
        }

        Object.keys(jsonObject).forEach((property) => {
            if (jsonObject.hasOwnProperty(property)) {
                t.set(property as any, setProperty(jsonObject[property]));
            }
        });
        return t;
    }

    /**
     * Outputs the contents of the map to a JSON object
     * 
     * @returns {{[key: string]: V}} 
     * @memberof TSMap
     */
    public toJSON(): { [key: string]: V } {
        let obj: { [key: string]: V } = {};
        let t = this;

        const getValue = (value: any): any => {
            if (value instanceof Dictionary) {
                return value.toJSON();
            } else if (Array.isArray(value)) {
                return value.map(v => getValue(v));
            } else {
                return value;
            }
        }

        t.keys().forEach((k) => {
            obj[JSON.stringify(k)] = getValue(t.get(k));
        });
        return obj;
    }

    /**
     * Get an array of arrays respresenting the map, kind of like an export function.
     * 
     * @returns {(Array<Array<K|V>>)}
     * 
     * @memberOf TSMap
     */
    public entries(): (K | V)[][] {
        return [].slice.call(this.keys().map(k => [k, this.get(k)]));
    }

    /**
     * Get an array of keys in the map.
     * 
     * @returns {Array<K>}
     * 
     * @memberOf TSMap
     */
    public keys(): K[] {
        return [].slice.call(this._keys);
    }

    /**
     * Get an array of the values in the map.
     * 
     * @returns {Array<V>}
     * 
     * @memberOf TSMap
     */
    public values(): V[] {
        return [].slice.call(this._values);
    }

    private indexOfKey(k: K): number {
        if (this.comparer) {
            for (let i = 0; i < this._keys.length; i++) {
                if (this.compareKey(this._keys[i], k) == 0) {
                    // equal
                    return i;
                }
            }
            return -1;
        }

        return this._keys.indexOf(k);
    }

    private compareKey(a: K, b: K): number {
        if (this.comparer) {
            return this.comparer(a, b);
        }

        if (typeof a == 'number') {
            // @ts-ignore
            return a - b;
        }

        return String.naturalCompare(a + '', b + '');
    }

    /**
     * Check to see if an item in the map exists given it's key.
     * 
     * @param {K} key
     * @returns {Boolean}
     * 
     * @memberOf TSMap
     */
    public has(key: K): boolean {
        return this.indexOfKey(key) > -1;
    }

    /**
     * Get a specific item from the map given it's key.
     * 
     * @param {K} key
     * @returns {V}
     * 
     * @memberOf TSMap
     */
    public get(key: K): V {
        let i = this.indexOfKey(key);
        return i > -1 ? this._values[i] : undefined;
    }

    /**
     * Safely retrieve a deeply nested property.
     * 
     * @param {K[]} path 
     * @returns {V} 
     * 
     * @memberOf TSMap
     */
    public deepGet(path: K[]): V {
        if (!path || !path.length) return null;

        const recursiveGet = (obj: any, path: K[]): V => {
            if (obj === undefined || obj === null) return null;
            if (!path.length) return obj;
            return recursiveGet(obj instanceof Dictionary ? obj.get(path[0]) : obj[path[0]], path.slice(1));
        }

        return recursiveGet(this.get(path[0]), path.slice(1));
    }


    /**
     * Set a specific item in the map given it's key, automatically adds new items as needed. 
     * Ovewrrites existing items
     * 
     * @param {K} key
     * @param {V} value
     * 
     * @memberOf TSMap
     */
    public set(key: K, value: V): this {
        let t = this;
        // check if key exists and overwrite
        let i = this.indexOfKey(key);
        if (i > -1) {
            t._values[i] = value;
        } else {
            t._keys.push(key);
            t._values.push(value);
            t.length = t._values.length;
        }
        return this;
    }

    /**
     * Enters a value into the map forcing the keys to always be sorted.
     * Stolen from https://machinesaredigging.com/2014/04/27/binary-insert-how-to-keep-an-array-sorted-as-you-insert-data-in-it/
     * Best case speed is O(1), worse case is O(N).
     * 
     * @param {K} key 
     * @param {V} value 
     * @param {number} [startVal] 
     * @param {number} [endVal] 
     * @returns {this} 
     * @memberof TSMap
     */
    public sortedSet(key: K, value: V, startVal?: number, endVal?: number): this {
        const t = this;
        const length = this._keys.length;
        const start = startVal || 0;
        const end = endVal !== undefined ? endVal : length - 1;

        if (length == 0) {
            t._keys.push(key);
            t._values.push(value);
            return t;
        }

        if (this.compareKey(key, this._keys[start]) == 0) {
            this._values[start] = value;
            return this;
        }

        if (this.compareKey(key, this._keys[end]) == 0) {
            this._values[end] = value;
            return this;
        }

        if (this.compareKey(key, this._keys[end]) > 0) {
            this._keys.splice(end + 1, 0, key);
            this._values.splice(end + 1, 0, value);
            return this;
        }

        if (this.compareKey(key, this._keys[start]) < 0) {
            this._values.splice(start, 0, value);
            this._keys.splice(start, 0, key);
            return this;
        }

        if (start >= end) {
            return this;
        }

        const m = start + Math.floor((end - start) / 2);

        if (this.compareKey(key, this._keys[m]) < 0) {
            return this.sortedSet(key, value, start, m - 1);
        }

        if (this.compareKey(key, this._keys[m]) > 0) {
            return this.sortedSet(key, value, m + 1, end);
        }
        return this;
    }

    /**
     * Provide a number representing the number of items in the map
     * 
     * @returns {number}
     * 
     * @memberOf TSMap
     */
    public get size(): number {
        return this.length;
    }

    /**
     * Clear all the contents of the map
     * 
     * @returns {Dictionary<K,V>}
     * 
     * @memberOf TSMap
     */
    public clear(): this {
        let t = this;
        t._keys.length = t.length = t._values.length = 0;
        return this;
    }

    /**
     * Delete an item from the map given it's key
     * 
     * @param {K} key
     * @returns {Boolean}
     * 
     * @memberOf TSMap
     */
    public delete(key: K): boolean {
        let t = this;
        let i = t._keys.indexOf(key);
        if (i > -1) {
            t._keys.splice(i, 1);
            t._values.splice(i, 1);
            t.length = t._keys.length;
            return true;
        }
        return false;
    }

    /**
     * Used to loop through the map.  
     * 
     * @param {(value:V,key?:K,index?:number) => void} callbackfn
     * 
     * @memberOf TSMap
     */
    public forEach(callbackfn: (value: V, key?: K, index?: number) => void): void {
        this._keys.forEach((v, i) => {
            callbackfn(this.get(v), v, i);
        });
    }

    /**
     * Returns an array containing the returned value of each item in the map.
     * 
     * @param {(value:V,key?:K,index?:number) => any} callbackfn
     * @returns {Array<any>}
     * 
     * @memberOf TSMap
     */
    public map(callbackfn: (value: V, key?: K, index?: number) => any): any[] {
        return this.keys().map((itemKey, i) => {
            return callbackfn(this.get(itemKey), itemKey, i);
        });
    }


    /**
     * Removes items based on a conditional function passed to filter.
     * Mutates the map in place.
     * 
     * @param {(value:V,key?:K,index?:number) => Boolean} callbackfn
     * @returns {Dictionary<K,V>}
     * 
     * @memberOf TSMap
     */
    public filter(callbackfn: (value: V, key?: K, index?: number) => Boolean): this {
        let t = this;
        [...t._keys].forEach((v, i) => {
            if (callbackfn(t.get(v), v, i) === false) t.delete(v);
        });
        return this;
    }

    /**
     * Creates a deep copy of the map, breaking all references to the old map and it's children.
     * Uses JSON.parse so any functions will be stringified and lose their original purpose.
     * 
     * @returns {Dictionary<K,V>}
     * 
     * @memberOf TSMap
     */
    public clone(): Dictionary<K, V> {
        return new Dictionary<K, V>(this);
    }
}
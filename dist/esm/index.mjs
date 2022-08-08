function naturalCompare(a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi, sre = /(^[ ]*|[ ]*$)/g, dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/, hre = /^0x[0-9a-f]+$/i, ore = /^0/, x = a.toString().replace(sre, '') || '', y = b.toString().replace(sre, '') || '', xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'), yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'), xDn = x.match(hre), yDn = y.match(hre), xD = (xDn ? parseInt(xDn[0]) : 0) || (xN.length != 1 && x.match(dre) && Date.parse(x)), yD = (yDn ? parseInt(yDn[0]) : 0) || xD && y.match(dre) && Date.parse(y) || null;
    if (yD && xD != null)
        if (xD < yD)
            return -1;
        else if (xD > yD)
            return 1;
    for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        let oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        let oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        if (isNaN(oFxNcL) !== isNaN(oFyNcL))
            return (isNaN(oFxNcL)) ? 1 : -1;
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL)
            return -1;
        if (oFxNcL > oFyNcL)
            return 1;
    }
    return 0;
}
export class Dictionary {
    constructor(another, comparer = null) {
        this.comparer = null;
        let t = this;
        t._keys = [];
        t._values = [];
        t.length = 0;
        if (another) {
            let entries = another instanceof Array ? another : another.entries();
            if (entries) {
                entries.forEach(v => {
                    t.set(v[0], v[1]);
                });
            }
        }
        this.comparer = comparer;
    }
    fromJSON(jsonObject, convertObjs) {
        let t = this;
        const setProperty = (value) => {
            if (value !== null && typeof value === 'object' && convertObjs)
                return new Dictionary().fromJSON(value, true);
            if (Array.isArray(value) && convertObjs)
                return value.map(v => setProperty(v));
            return value;
        };
        Object.keys(jsonObject).forEach((property) => {
            if (jsonObject.hasOwnProperty(property)) {
                t.set(property, setProperty(jsonObject[property]));
            }
        });
        return t;
    }
    toJSON() {
        let obj = {};
        let t = this;
        const getValue = (value) => {
            if (value instanceof Dictionary) {
                return value.toJSON();
            }
            else if (Array.isArray(value)) {
                return value.map(v => getValue(v));
            }
            else {
                return value;
            }
        };
        t.keys().forEach((k) => {
            obj[JSON.stringify(k)] = getValue(t.get(k));
        });
        return obj;
    }
    entries() {
        return [].slice.call(this.keys().map(k => [k, this.get(k)]));
    }
    keys() {
        return [].slice.call(this._keys);
    }
    values() {
        return [].slice.call(this._values);
    }
    indexOfKey(k) {
        if (this.comparer) {
            for (let i = 0; i < this._keys.length; i++) {
                if (this.compareKey(this._keys[i], k) == 0) {
                    return i;
                }
            }
            return -1;
        }
        return this._keys.indexOf(k);
    }
    compareKey(a, b) {
        if (this.comparer) {
            return this.comparer(a, b);
        }
        if (typeof a == 'number') {
            return a - b;
        }
        return naturalCompare(a + '', b + '');
    }
    has(key) {
        return this.indexOfKey(key) > -1;
    }
    get(key, default_value = undefined) {
        let i = this.indexOfKey(key);
        return i > -1 ? this._values[i] : default_value;
    }
    deepGet(path) {
        if (!path || !path.length)
            return null;
        const recursiveGet = (obj, path) => {
            if (obj === undefined || obj === null)
                return null;
            if (!path.length)
                return obj;
            return recursiveGet(obj instanceof Dictionary ? obj.get(path[0]) : obj[path[0]], path.slice(1));
        };
        return recursiveGet(this.get(path[0]), path.slice(1));
    }
    set(key, value) {
        let t = this;
        let i = this.indexOfKey(key);
        if (i > -1) {
            t._values[i] = value;
        }
        else {
            t._keys.push(key);
            t._values.push(value);
            t.length = t._values.length;
        }
        return this;
    }
    sortedSet(key, value, startVal, endVal) {
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
    get size() {
        return this.length;
    }
    clear() {
        let t = this;
        t._keys.length = t.length = t._values.length = 0;
        return this;
    }
    delete(key) {
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
    deleteAtIndex(index) {
        let t = this;
        if (index < t._keys.length && index > -1) {
            t._keys.splice(index, 1);
            t._values.splice(index, 1);
            t.length = t._keys.length;
            return true;
        }
        return false;
    }
    forEach(callbackfn) {
        this._keys.forEach((v, i) => {
            callbackfn(this.get(v), v, i);
        });
    }
    map(callbackfn) {
        return this.keys().map((itemKey, i) => {
            return callbackfn(this.get(itemKey), itemKey, i);
        });
    }
    filter(callbackfn) {
        let t = this;
        [...t._keys].forEach((v, i) => {
            if (callbackfn(t.get(v), v, i) === false)
                t.delete(v);
        });
        return this;
    }
    clone() {
        return new Dictionary(this);
    }
}
//# sourceMappingURL=index.js.map
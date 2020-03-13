export default class DataContainer {
    constructor(wrapperClass) {
        this.data = {};
        this.wrapperClass = wrapperClass;
    }

    add(src) {
        if (src.length > 0) {
            src.forEach(item => {
                if (!item.id) { throw "not exists id : " + JSON.stringify(item); }
                this.data[item.id] = item;
            })
        } else {
            this.data[src.id] = src;
        }
    }

    get(id) {
        return this.data[id];
    }

    exists(id) {
        return this.data[id] !== undefined && this.data[id] !== null;
    }

    forEach(callback) {
        for(const key in this.data) {
            const value = this.data[key];
            callback(value, key);
        }
    }

    select(callback) {
        const result  = [];
        for(const key in this.data) {
            const value = this.data[key];
            if (callback(value, key)) {
                result.push(value);
            }
        }
        
        return result;
    }

    toArray() {
        return Object.values(this.data);
    }

    count() {
        return Object.keys(this.data).length;
    }
}
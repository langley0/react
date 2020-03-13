export default class Resource {
    constructor(data, count) {
        Object.assign(this, data);
        this.count = count || 0;
    }

    modify(delta) {
        this.count += delta;
    }
}
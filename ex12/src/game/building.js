export default class Building {
    constructor(data) {
        Object.assign(this, data);
        this.work = null;
        this.built = false;
    }

    onBuilding() {
        return this.work !== null;
    }

    isBuilt() {
        return this.built;
    }

    startBuild(work) {
        this.work = work;
    }

    endBuild() {
        this.work = null;
        this.built = true;
    }

    getResources() {
        return this.build.resources;
    }
}
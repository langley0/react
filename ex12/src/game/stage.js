export default class Stage {
    constructor(data) {
        // 자신에게 데이터를 덮어씌운다
        Object.assign(this, data);

        this.found = false;
        this.visited = 0;
        this.work = null;
    }

    startExplore(work) {
        this.work = work;
    }

    endExplore() {
        this.work = null;
        ++this.visited;

        return this.getExploreResult();
    }

    isExploring() {
        return this.work !== null;
    }

    getExploreResult() {
        return this.resources.reduce((result, res) => {
            // 리소스목록에 추가한다
            const count = Math.floor((res.max - res.min + 1) * Math.random()) + res.min;
            result.push({ id: res.id, count: count} );
            return result;
        }, []);
    }
}
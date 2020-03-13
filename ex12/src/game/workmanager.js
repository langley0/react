import Work from "./work";

export default class WorkManager {
    constructor() {
        this.works = new Array();
    }

    explore(stageid, workers, startTime, duration, onCompleted) {
        const work = new Work();
        work.type = "explore";
        work.target = stageid;
        work.start = startTime;
        work.duration = duration;
        work.end = startTime + duration;
        work.workerNumber = workers;
        work.onCompleted = onCompleted;

        this.works.push(work);

        return work;
    }

    build(building, workers, startTime, duration, onCompleted) {
        const work = new Work();
        work.type = "build";
        work.target = building;
        work.start = startTime;
        work.duration = duration;
        work.end = startTime + duration;
        work.workerNumber = workers;
        work.onCompleted = onCompleted;

        this.works.push(work);

        return work;
    }

    update(now) {
        const completedWorks = this.works.filter(item => item.end <= now);
        
        // 본작업에서 제거한다
        completedWorks.forEach(work => {
            const index = this.works.indexOf(work);
            this.works.splice(index, 1);;
        });

        // 완료 이벤트를 처리한다
        completedWorks.forEach(work => {
            if (work.onCompleted) {
                work.onCompleted(work);
            }
        });
    }

    getWorkerNumber() {
        let result = 0;
        this.works.forEach(work => {
            result += work.workerNumber;
        });
        return result;
    }   
}
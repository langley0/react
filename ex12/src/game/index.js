import DataContainer from "./datacontainer";

import stages_data from "./stages";
import resources_data from "./resources";
import buildings_data from "./buildings";
import events_data from "./events";

import Stage from "./stage";
import Resource from "./resource";
import Building from "./building";
import WorkManager from "./workmanager";

const Stages = new DataContainer();
const Resources = new DataContainer();
const Buildings = new DataContainer();
const Events = new DataContainer();

export default class Game {
    // field, resource, building, survivor, battle(enemy) 로 구성되어 있다
    // 이것을 다시 userdata 에 의해서 구분하게 된다

    constructor() {
        this.config = {
            updateInterval: 1000,
        };

        this.workManager = new WorkManager();

        this.stages = new DataContainer();
        this.events = new DataContainer();
        this.resources = new DataContainer();
        this.buildings = new DataContainer();
        this.survivors = 1;
    }

    start() {
        this.update();        
    }

    stop() {
        clearTimeout(this.timer);
    }

    load() {
        Stages.add(stages_data);
        Resources.add(resources_data);
        Buildings.add(buildings_data);
        Events.add(events_data)
    }

    loadUserData() {
    }

    getStages() {
        return this.stages.toArray();
    }

    getAvailableSurvivors() {
        return this.survivors - this.workManager.getWorkerNumber();
    }

    update() {
        const now = Date.now();
        this.workManager.update(now);
        this.updateEvent();

        this.timer = setTimeout(() => this.update(), this.config.updateInterval);
    }

    updateEvent() {
        const invoked = [];

        // 트리거되는 이벤트를 찾는다
        Events.forEach((event)=> {
            if (event.repeatable || !this.events.exists(event.id)) {
                if (!event.condition || event.condition(this)) {
                    invoked.push(event);
                }
            }
        });

        // 이벤트에 해당하는 명령을 실행한다
        invoked.forEach(event => {
            if (this.events.exists(event.id)) {
                this.events.get(event.id).count ++;
            } else {
                this.events.add({id: event.id, count: 1});
            }
            
            event.commands.forEach(command => this.executeCommand(...command));
        });
        
    }

    executeCommand(command, ...args) {
        switch(command) {
            case "journal": {
                const text = args[0];
                const lines = text.split("\n");
                for(const line of lines) {
                    this.notify(line);
                }
            }
            break;
            case "addstage": {
                const sid = args[0];
                // 이미 스테이지를 가지고 있는지>
                const data = Stages.get(sid);
                if (data && !this.stages.exists(sid)) {
                    this.stages.add(new Stage(data));
                    this.notify(`새로운 장소를 발견하였다 : [${data.name}]`)
                }
            }
            break;
            case "addbuilding": {
                const bid = args[0];
                const data = Buildings.get(bid);
                if (data && !this.buildings.exists(bid)) {
                    this.buildings.add(new Building(data));
                    this.notify(`새로운 건물을 발견하였다 : [${data.name}]`);
                }
            }
            break;
            case "addsurvivor": {
                const count = args[0];
                this.survivors += count;
            }
            break;
        }
    }
    
    notify(text) {
        console.log(text);
    }

    explore(sid) {
        const now = Date.now();

        const stage = this.stages.get(sid);
        if(stage === null || stage.isExploring()) {
            return false;
        }

        const onComplete = () => {
            const resources = stage.endExplore();
            resources.forEach(res => {
                const resource = this.resources.get(res.id);
                if (resource) {
                    resource.modify(res.count);
                } else {
                    const data = Resources.get(res.id);
                    this.resources.add(new Resource(data, res.count));
                }
            });
            
            const rnames = [];
            resources.forEach(res => {
                const data = Resources.get(res.id);
                rnames.push(data.name+"("+res.count+")");
            });

            this.notify(`[${stage.name}]에서 무언가를 찾았다. ${rnames.join(", ")}`)
        };

        if (this.getAvailableSurvivors() >= stage.exploreRequired) {
            // 액션을 추가한다
            const work = this.workManager.explore(
                sid, 
                stage.exploreRequired,
                now, 
                Math.floor(stage.exploreDuration * 1000),
                onComplete)

            stage.startExplore(work);

            return true;
        }

        return false;
    }

    canBuild(bid) {
        const building = this.buildings.get(bid);
        if (!building) { return false; }
        if (building.onBuilding() || building.isBuilt())  { return false; }
        
        // 건물을 짓기위한 요구조건이 충족되는지 확인한다
        const requiementOk = Array.from(building.requirement).every(item => {
            // 여기서 요구조건 검사를 한다
            return true;
        });
        if (!requiementOk) { return false; }
        
        // 자원이 있는지 확인한다
        const resourcesOk = Array.from(building.getResources()).every(item => {
            const myRes = this.resources.get(item.id)
            if (myRes) {
                return myRes.count >= item.count;
            } else {
                return false;
            }
        });
        return resourcesOk;
    }

    build(bid) {
        const now = Date.now();

        // 건물을 짓는다
        // 필요한 자원이 있는지 확인하고, 지을수 있다면 자원을 사용하여 건물을 짓는다
        if (!this.canBuild(bid)) {
            return false;
        }
        
        // 작업을 진행한다
        const building = this.buildings.get(bid);
        if (this.getAvailableSurvivors() >= building.build.survivors) {
            const onCompleted = () => {
                building.endBuild();
                this.notify(`건설을 완료하였다 : [${building.name}]`)
            };

            const work = this.workManager.build(
                bid,
                building.build.survivors,
                now, 
                Math.floor(building.build.duration * 1000),
                onCompleted);

            // 건설중 표시를 한다
            building.startBuild(work);
            // 자원을 제거한다
            building.getResources().forEach(res => {
                this.resources.get(res.id).modify(-res.count);
            });

            return true;
        }
    }
}


import fields_data from "./fields";
import resources_data from "./resources";
import collections_data from "./collections";

export default class Game {
    // field, resource, building, survivor, battle(enemy) 로 구성되어 있다
    // 이것을 다시 userdata 에 의해서 구분하게 된다

    constructor() {
        this.config = {
            updateInterval: 1000,
        };

        this.stages = {};
        this.events = {};

        this.userdata = null;
    }

    start() {
        this.update();        
    }

    stop() {
        clearTimeout(this.timer);
    }

    load() {
        this.collections = collections_data;
        this.resources = resources_data;

        this.loadStages();
        this.loadEvents();
        this.loadUserData();
    }

    loadUserData() {
        this.userdata = {
            survivor: 1,
            stages: {},
            works: [],
            events: [],
            collections: [],
        }
    }

    loadStages() {
        // 나중에 asset 에서 비동기로 로딩하는 것으로 바꾸어야 한다.
        // 지금은 다이렉트로 사용
        fields_data.reduce((container, item) => {
            container[item.id] = item;
            return container;
        }, this.stages);
    }

    loadEvents() {
        this.events[1] = {
            id: 1,
            condition: null,
            repeatable: false,
            commands: [ 
                ["journal", "Intro"],
                ["addstage", 1],
            ]
        };

        this.events[2] = {
            id: 2,
            condition: (userdata) => {
                const target = userdata.stages[1];
                return (target && target.visit > 0);
            },
            repeatable: false,
            commands: [
                ["journal", "Next Stage"],
                ["addstage", 2],
            ]
        };
    }

    getAvailableStages() {
        return Object.keys(this.userdata.stages).map(fid => this.stages[fid]);
    }

    getAvailableSurvivors() {
        const workingSurvivors =  this.userdata.works.reduce((count, action) => {
            return count + action.survivors;
        }, 0);
        return this.userdata.survivor - workingSurvivors;
    }

    update() {
        this.updateWorks();
        this.updateEvent();

        this.timer = setTimeout(() => this.update(), this.config.updateInterval);
    }

    updateWorks() {
        const now = Date.now();
        // 완료된 작업을 별도로 처리한다
        const completedWorks = this.userdata.works.filter(item => item.end <= now);
        
        // 본작업에서 제거한다
        completedWorks.forEach(work => {
            const index = this.userdata.works.indexOf(work);
            this.userdata.works.splice(index, 1);;
        });
        
        // 완료 이벤트를 처리한다
        completedWorks.forEach(work => {
            this.onWorkCompleted(work);
        });
    }

    onWorkCompleted(work) {
        if (work.type === "explore") {
            const sid = work.target;
            const info = this.userdata.stages[sid];
            info.visit = info.visit + 1;
            
            const stage = this.stages[sid];
            const found = stage.collections.reduce((result, stageCollection) => {
                if (Math.random() < stageCollection.rate) {
                    // 리소스목록에 추가한다
                    result.push({ 
                        stage: sid,
                        id: stageCollection.id, 
                        expire: stageCollection.expire * 1000 + Date.now()
                    });
                    
                    const collection = this.collections[stageCollection.id];
                    this.notify(`[${collection.name}] 를 발견하여 지도에 기록하였습니다`);
                }
                return result;
            }, []);

            // 
            this.userdata.collections.push(...found);

            this.notify(`탐색을 완료하였습니다 : [${work.text}]`)
        } else {
            this.notify(`작업을 완료하였습니다 : [${work.text}]`)
        }
    }

    updateEvent() {
        const events = [];

        // 트리거되는 이벤트를 찾는다
        for(const evtid in this.events) {
            const event = this.events[evtid];
            if (event.condition === null || event.condition(this.userdata)) {
                if (event.repeatable || this.userdata.events.indexOf(Number(evtid)) < 0) {
                                events.push(event);
                }
            }
        }

        // 이벤트에 해당하는 명령을 실행한다
        events.forEach(event => {
            if (!event.repeatable) {
                this.userdata.events.push(event.id);
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

                const data = this.stages[sid];
                if (!this.userdata.stages[sid]) {
                    this.userdata.stages[sid] = { visit: 0 };
                    this.notify(`새로운 장소를 발견하였습니다 : [${data.name}]`)
                }
            }
            break;
        }
    }
    
    notify(text) {
        console.log(text);
    }

    explore(sid) {
        const stage = this.stages[sid];

        if (this.getAvailableSurvivors() >= stage.exploreRequired) {
            // 액션을 추가한다
            const now = Date.now();
            this.userdata.works.push({
                type: "explore",
                target: sid,
                survivors: stage.exploreRequired,
                start: now,
                end: now + Math.floor(stage.exploreDuration * 1000),

                text: `${stage.name} 탐색`,
            });

            // 이미 탐색중인 field 는 다시 탐색하지 않도록 한다
            // start - finish 마크업을 해야할듯

            return true;
        }

        return false;
    }
}


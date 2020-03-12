const events = [];
const _events = [
    {
        condition: (state) => {
            return (state.tags.indexOf("newgame") === -1);
        },
        do: (state, engine) => {
            state.tags.push("newgame");
            engine.notify("당신은 눈을 살며시 떴다");
        }
    } ,
    {
        condition: (state) => {
            return state.tags.indexOf("newgame") >= 0 && 
            state.actions.indexOf("button") === -1;
        },
        
        do: (state, engine) => {
            state.actions.push("button");
            engine.notify("눈 앞에 버튼이 보인다");
        }
    }   
]

const skills = {
    "basic-attack": {
        type: "passive",
        apply: (state)=>{ 
            const { base } = state;
            base.attack = (base.attack || 0) + 1;
        },
    },
};


export default class GameScript {
    constructor(gameEngine) {
        this.state = { 
            player: {
                stat: {},
                skills: [{name: "basic-attack"} ],

                hp: 10,
                maxhp: 10,
            },

            monster: {
                hp: 10,
                maxhp: 10,
                attack: 0,
            },

            resources: {},
        };

        this.engine = gameEngine;
        this.update = this.update.bind(this);

        this.intervalTime = 30;
        this.timer = null;

        this.onClick = this.onClick.bind(this);

        this.template = {
            player: {
                lastAttack: Date.now(),
                nextAttack: Date.now(),
            },

            monster: {
                lastAttack: Date.now(),
                nextAttack: Date.now(),
            }
        }
    }

    getState() {
        return Object.assign({}, this.state);
    }

    start() {
        if (this.timer === null) {
            this.engine.on("click", this.onClick);

            this.timer = setTimeout(this.update, this.intervalTime)
        }
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;

            this.engine.off("click", this.onClick);
        }
    }

    applyPasive() {
        const playerSkills = this.state.player.skills.map(el => skills[el.name]);
        const tempState = {
            base: {},
            amp: {},
        }
        for(const skill of playerSkills) {
            if (skill.type === "passive") {
                skill.apply(tempState);
            }
        }

        this.state.player.stat = {}
        for(const key of Object.keys(tempState.base)) {
            this.state.player.stat[key] = 
                tempState.base[key] * 
                (tempState.amp[key] || 1);
        }

    }

    update() {
        let invalidated = false;
        // 차이를 좀 더 멋지게 비교할 수 있을것 같다
        const backup = JSON.stringify(this.state.player.stat);
        this.applyPasive();
        const updated = JSON.stringify(this.state.player.stat);
        if (backup !== updated) {
           invalidated = true; 
        }

        // 계산된 스탯으로 공격을 진행한다
        const now = Date.now();
        if (this.template.player.nextAttack <= now) {
            this.template.player.lastAttack = this.template.player.nextAttack;
            this.template.player.nextAttack += 1000;

            this.state.monster.hp -= (this.state.player.stat.attack || 0);
            if (this.state.monster.hp < 0 ) { this.state.monster.hp = 0; }

            invalidated = true;
        }


        if (invalidated) {
            this.engine.dispatch("state-changed", this.state);
        }


        /*// 거대한 스크립트를 실행!
        const conditionedEvents = [];
        for(const event of events) {
            if (event.condition(this.state)) {
                conditionedEvents.push(event);
            }
        }

        for (const event of conditionedEvents) {
            event.do(this.state, this.engine);
        }

        if (conditionedEvents.length > 0) {
            this.engine.dispatch("state-changed", this.state);
        }*/

        // 다음인버터벌을 예약
        this.timer = setTimeout(this.update, this.intervalTime)
    }
    
    onClick() {
         if (this.state.tags.indexOf("gold") === -1) {
            this.state.tags.push("gold");
            this.engine.notify("손안을 보니 금화가 하나 쥐어져 있다");
            this.state.resources["금화"] = 0;
        }

        this.state.resources["금화"] += this.state.goldPerClick;
        this.engine.dispatch("state-changed", this.state);
    }
}
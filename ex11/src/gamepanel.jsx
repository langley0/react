import React from "react";
import Button from "./button";
import Notification from "./notifications";
import DataContainer from "./datacontainer";

import GameEngine from "./gameengine";
import GameScript from "./gamescript";
import HpBar from "./hpbar";
import Tab from "./tab";

const styles = {
    main: {
        margin: "auto",
        position: "relative",
        width: 600,

        fontSize: 16,
        padding: "20px 0 0 300px",
    },

    content: {
        
        position: "relative",
        height: 700,
        overflow: ",hidden",
    },

    resources: {
        position: "absolute",
        right: 0,
        top: 0,
    },

    hpContainer: {
        position: "relative",
    },

    hpFrame: {
        position: "relative",
        marginBottom: 15,
    },
}



export default class GamePanel extends React.Component {

    constructor(props) {
        super(props);

        this.engine = new GameEngine();
        this.script = new GameScript(this.engine);
        this.state = this.script.getState();
        this.onStateChanged = this.onStateChanged.bind(this);
    }

    

    componentDidMount() {
        this.engine.on("state-changed", this.onStateChanged);
        this.script.start();
    } 
    
    componentWillUnmount() {
        this.script.stop();
        this.engine.off("state-changed", this.onStateChanged);
    }

    onStateChanged(state) {
        this.setState({ ...state });
    }

    hasAction(action) {
        //return this.state.actions.indexOf(action) >= 0;
        return false;
    }

    hasTag(tag) {
        return this.state.tags.indexOf(tag) >= 0;
    }

    objectToData(obj) {
        return Object.keys(obj).map(key => { return { key: key, value: obj[key] }});
    }

    render() {
        const resources = this.objectToData(this.state.resources);
        const stat = this.objectToData(this.state.player.stat);
        const player = this.state.player;
        const monster = this.state.monster;
        
        return (
        <div style={styles.main}>
            <Notification engine={this.engine}/>
            <div style={styles.content}>
                <div >
                    <div style={styles.hpFrame}>
                    <div>Player</div><HpBar hp={player.hp} maxhp={player.maxhp}/>
                    </div>
                    <div style={styles.hpFrame}>
                    <div>Enemy</div><HpBar hp={monster.hp} maxhp={monster.maxhp}/>
                    </div>
                </div>

                { this.hasAction("button") ? <Button 
                    style={{width: 120 }} 
                    text="버튼을 누른다"
                    onClick={() => { this.engine.click(); }}/> : null }
                <div style={styles.resources}>
                    <Tab>
                        <div label="stat" >
                            <DataContainer items={stat}/>
                        </div>
                        <div label="skill" />
                        <div label="inventory" >
                            <DataContainer items={[{key: "item", value:"value"}]}/>
                        </div>
                    </Tab>
                </div>
            </div>
        </div>);
    }
}
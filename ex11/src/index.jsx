import React from "react";
import ReactDOM from "react-dom";

import DataContainer from  "./datacontainer";
import ButtonContainer from  "./button";
import Notifications from "./notifications";
import Dialog from "./dialog";

import styles  from "./styles";

class App extends React.Component {
    render() {
        return <div style={styles.root}>
            <DataContainer items={["gold", "wood", "stone", "iron"]}/>
            <br /><br />
            <ButtonContainer title={"건설"} items={["농장", "벌목장", "제철소", "채석장"]}/>
            <br/><br/>
            <Notifications/>
            <Dialog description={"늙은 나그네가 나타난다.\n따뜻한 미소를 지으며 밤을 지낼 오두막을 청한다."} buttons={["수락", "거절"]}/>
        </div>
    }

}


ReactDOM.render(
    (
        <App />
    ),
    document.getElementById("root")
);
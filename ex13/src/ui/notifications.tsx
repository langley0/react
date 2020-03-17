import React from "react";
import CSS from "csstype";
import Notification from "./notification";



const notificationsStyle: CSS.Properties = {
    background: "inherit",
    position: "absolute",
    overflow: "hidden",
    userSelect: "none",
    
    width: "300px",
    height: "700px",
    top: "20px",
    left: 0,
}

type Props = {
    dispatcher: any,
    data: any,
}

type State = {
    list: any[]
}



export default class Notifications extends React.Component<Props, State> {
    private nextIndex: number;

    constructor(props: Props) {
        super(props);
        
        this.state = {
            list: []
        };

        this.onAdd = this.onAdd.bind(this);
        this.nextIndex = 0; 
    }

    componentDidMount() {
        const { dispatcher } = this.props;
        if (dispatcher) {
            dispatcher.on("write", this.onAdd);
        }
    }

    componentWillUnmount() {
        const { dispatcher } = this.props;
        if (dispatcher) {
            dispatcher.off("write", this.onAdd);
        }
    }

    onAdd(noti: string) {
        const { dispatcher, data } = this.props;
        const { list } = this.state;
        ++this.nextIndex;
        list.push(<Notification key={"notify-"+ this.nextIndex} context={noti} dispatcher={dispatcher} data={data}/>);
        while(list.length > 20) {
            list.shift();
        }

        this.setState({ list });
    }

    render() {
        const { list } = this.state;
        return (
        <div style={notificationsStyle}>
            {
                list && list.map((value) => value)
            }
        </div>
        )
    }
}
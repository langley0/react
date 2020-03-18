import React from "react";
import Node from "./node";

const style = {
    cursor:"pointer", 
    textDecoration:"underline",
    color: "#88f",
};

const clickedStyle = {
}

type Props = {
    onClick?: () => void,
};

type State = {
    clicked: boolean,
};

class View extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            clicked: false,
        };
    }
    
    onClick() {
        if (this.state.clicked) { 
            return;
        }

        this.setState((prev) => {
            if (!prev.clicked) {
                const action = this.props.onClick;
                if (action) { action(); }
                return { clicked: true };
            } else {
                return null;
            }
        });
    }

    render() {
        const { children } = this.props;
        return <span style={this.state.clicked? clickedStyle : style} onClick={this.onClick.bind(this)}>{ children}</span>
    }
}

export class Model extends Node {
    constructor(private label: string | Node, private onClick?: ()=>void) {
        super();
    }

    render(key?: string) {
        // 페이지를 구성할때 최초로 한번 text expression을 실행한다
        return <View key={key} onClick={this.onClick}>{ typeof(this.label) === "string" ? this.label : this.label.render()  }</View>;
    }
}

export default Model;
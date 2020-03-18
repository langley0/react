import React from "react";
import Node from "./node";
import { dispatch, on, off } from "./dispatch";

const attributes: { [key: string]: string } = {}

type Props = {
    id: string
}

type State = {
    text: string
}

class VariableUI extends React.Component<Props, State> {
    private eventName: string;
    constructor(props: Props) {
        super(props);
        this.eventName = "replace("+props.id + ")";
        this.onAttributeChanged = this.onAttributeChanged.bind(this);

        this.state = {
            text: attributes[props.id],
        };
    }

    onAttributeChanged(value: string) {
        console.log("on", value);
        this.setState({ text: value });
    }

    componentDidMount() { 
        console.log("event register", this.eventName);
        on(this.eventName, this.onAttributeChanged);
    }

    componentWillUnmount() {
        off(this.eventName, this.onAttributeChanged);
    }

    render() {
        const { text } = this.state;
        if (text) {
            return <span>{text}</span>
        } else {
            return null;
        }
    }
}


export default class Variable extends Node {
    constructor(private id: string, private value?: string) {
        super();
    }

    getText(): string {
        return attributes[this.id] || "";
    }
  
    render(key?: string) {
        console.log(this.id, this.value);
        if (this.value) {
            // set value
            const result =  this.value; // 나중에 exrpession 으로 고친다
            if (result) {
                attributes[this.id] = result;
                dispatch("replace("+this.id + ")", result);
            } 
        }

        return <VariableUI key={key} id={this.id}/>
    }
    
}
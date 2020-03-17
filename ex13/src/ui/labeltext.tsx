import React from "react";
import Dispatcher from "../dispatcher";

type Props = {
    label: string,
    data: any,
    dispatcher: Dispatcher,
}

type State = {
    text: string
}

export default class Label extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            text: props.data.getValue(props.label),
        }

        this.onReplace = this.onReplace.bind(this);
    }

    onReplace(value: { label: string, text: string }) {
        if (value.label === this.props.label) {
            this.setState({ text: value.text });
        }
    }

    componentDidMount() {
        this.props.dispatcher.on("replace", this.onReplace);
    }

    componentWillUnmount() {
        this.props.dispatcher.off("replace", this.onReplace);
    }

    render() {
        return (<span>{ this.state.text }</span>);
    }
}
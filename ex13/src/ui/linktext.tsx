import React from "react";

type Props = {
    onClick: () => void
}

type State = {
}

export default class Link extends React.Component<Props, State> {
    render() {
        const { onClick } = this.props;

        return (<span 
            style={{color: "#eef", textDecoration: "underline", cursor:"pointer" }}
            onClick={onClick}
            >{ this.props.children }</span>);
    }
}
import React from "react";
import styles from "./styles";

export default class Tooltip extends React.Component {
    renderContext(context) {
        if (typeof(context) === "string" ) {
            return (<div>{context}</div>)
        } else {
            // 준비되지 않았음
            return null;
        }
    }
    render() {
        const { context } = this.props;
        
        return <div style={styles.container.tooltip}>{ this.renderContext(context) } }</div>;
    }
}
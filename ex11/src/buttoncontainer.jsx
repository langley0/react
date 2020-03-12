import React from "react";

import Button from "./button";
import _styles  from "./styles";

const styles = _styles.button;

export default class ButtonContainer extends  React.Component {
    render() {
        const {title, items } = this.props;
        return (
            <div style={styles.container}>
                <div style={styles.legend}>{title}</div>
                {
                    items.map((value, index) => <Button key={"button-" + index} item={value} />)
                }
            </div>
        );
    }
}
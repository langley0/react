import React from "react";
import styles from "./styles";
import Tooltip from "./tooltip"

class Row extends React.Component {

    constructor(props) {
        super(props);

        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);

        this.state = {
            hovered: false,
        };
    }

    showTooltip() {
        this.setState({hovered : true});
    }

    hideTooltip() {
        this.setState({hovered : false});
    }

    render() {
        const { item } = this.props;
        const { hovered } = this.state;

        return (
        <div style={styles.container.row}
        onMouseOver={this.showTooltip}
        onMouseOut={this.hideTooltip}>
            <div style={styles.container.key}>{item}</div>
            <div style={styles.container.value}>{0}</div>
            <div style={styles.container.clear} />
            { hovered ? <Tooltip/> : null }
        </div>);
    }
}

export default class DataContainer extends React.Component {

    render() {
        const {items} = this.props;
        return (
            <div style={styles.container}>
                <div style={styles.container.legend}>Resources</div>
                <div>
                {
                    items && items.map((item, index)=> <Row key={"item-"+index} item={item}/>)
                }
                </div>
            </div>);
    }
}
import React from "react";
import _styles  from "./styles";
import Tooltip from "./tooltip";

const styles = _styles.button;

export class Button extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            hovered: false,
            cooldown: null,
        };

        this.hoverEnabled = this.hoverEnabled.bind(this);
        this.hoverDisabled = this.hoverDisabled.bind(this);
        this.onClick = this.onClick.bind(this);
        this.processCooldown = this.processCooldown.bind(this);
    }

    hoverEnabled() {
        this.setState({hovered: true});
    }

    hoverDisabled() {
        this.setState({hovered: false});
    }

    onClick() {
        if (this.state.cooldown) { return; }

        const now = Date.now();
        const duration = 5000;
        const cooldown = { 
            startTime: now, 
            endTime: now + duration,
            rate: "100" }

        this.setState({ cooldown }, () => {
            setTimeout(this.processCooldown, 10);
        });
    }

    processCooldown() {
        const { cooldown } = this.state;
        const now = Date.now();
        if (cooldown.endTime <= now) {
            this.setState({ cooldown: null });
        } else {
            cooldown.rate = (100 - (now - cooldown.startTime) / (cooldown.endTime - cooldown.startTime) * 100).toFixed(2);
            this.setState({ cooldown }, () => {
                setTimeout(this.processCooldown, 10);
            }); 
        }
    }

    render() {
        const { item } = this.props;
        const { hovered, cooldown } = this.state;

        let style = Object.assign({}, styles.button);
        if (hovered) {
            style = Object.assign(style, styles.buttonHover);
        }

        let cooldownStyle = Object.assign({}, styles.cooldown);
        if (cooldown) {
            style = Object.assign(style, styles.buttonCooldown);
            cooldownStyle = Object.assign(cooldownStyle, { width: cooldown.rate + "%" });
        }

        return (<div 
            onMouseOver={this.hoverEnabled}
            onMouseOut={this.hoverDisabled}
            onClick={this.onClick}
            style={style}>{item}
            {cooldown ? <div style={cooldownStyle} /> : null }
            </div>);
    }
}

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
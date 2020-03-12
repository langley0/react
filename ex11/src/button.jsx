import React from "react";
import Tooltip from "./tooltip";

const styles =  {
    button: {
        position: "relative",
        textAlign: "center",
        border: "1px solid #EEE",
        padding: "5px 10px",
        marginBottom: 5,
        cursor: "pointer",
        userSelect: "none",
    },

    buttonHover: {
        textDecoration: "underline",
    },

    buttonCooldown: {
        textDecoration: "none",
        cursor: "default",
    },

    cooldown: {
        position: "absolute",
        backgroundColor: "#eee8",
        overflow: "hidden",
        height: "100%",
        top: 0,
        left: 0,
    },
}

export default class Button extends React.Component {
    static defaultProps = {
        onClick: function () {},
        item: { },
    }


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
        if (this.props.cooldown) {
            const now = Date.now();
            const duration = 5000;
            const cooldown = { 
                startTime: now, 
                endTime: now + duration,
                rate: "100" }
    
            this.setState({ cooldown }, () => {
                setTimeout(this.processCooldown, 10);
            });
        } else {
            this.props.onClick();
        }
    }

    processCooldown() {
        const { cooldown } = this.state;
        const now = Date.now();
        if (cooldown.endTime <= now) {
            this.setState({ cooldown: null }, ()=> {
                this.props.onClick();
            });
        } else {
            cooldown.rate = (100 - (now - cooldown.startTime) / (cooldown.endTime - cooldown.startTime) * 100).toFixed(2);
            this.setState({ cooldown }, () => {
                setTimeout(this.processCooldown, 10);
            }); 
        }
    }

    render() {
        const { text, tooltip } = this.props;
        const { hovered, cooldown } = this.state;

        let style = Object.assign({}, styles.button);
        style = Object.assign(style, this.props.style || {});
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
            style={style}>
                {text}
                {cooldown ? <div style={cooldownStyle} /> : null }
                {tooltip ? <Tooltip context={tooltip}/> : null }
            </div>);
    }
}
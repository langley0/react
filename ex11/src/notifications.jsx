import React from "react";

const styles = {
    notifications: {
        background: "inherit",
        position: "absolute",
        overflow: "hidden",
        userSelect: "none",

        width: 300,
        height: 700,
        top: 20,
        left: 0,
    },

    notification: {
        marginBottom: 10,
    },

    gradient: {
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: "100%",
        background: "linear-gradient( rgba(39, 40, 35, 0) 0%, rgba(39, 40, 35, 1) 100% )",
    }
}

class Notification extends React.Component {
    constructor(props) {
        super(props);

        this.updateOpacity = this.updateOpacity.bind(this);

        this.state = {
            opacity: 0,
            cooldown: null,
        }
    }

    componentDidMount() {
        const now = Date.now();
        this.setState({
            cooldown: {
                start: now,
                end: now + 300,
            }
        }, this.updateOpacity);           
    }

    updateOpacity() {
        const { cooldown }  = this.state
        if (!cooldown) { return; }

        const now = Date.now();
        if (now >= cooldown.end) {
            this.setState({ opacity: 1, cooldown: null });
        } else {
            const rate = (now - cooldown.start) /(cooldown.end - cooldown.start);
            this.setState({ opacity: rate });
            setTimeout(this.updateOpacity, 20);
        }
    }

    render() {
        const { context } = this.props;
        const { opacity } = this.state;

        let style = Object.assign({}, styles.notification);
        style = Object.assign(style, { opacity })
        return (<div style={style}>{context}</div>);
    }
}

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            list: []
        };

        this.onAdd = this.onAdd.bind(this);
        this.nextIndex = 0; 
    }

    componentDidMount() {
        const { engine } = this.props;
        if (engine) {
            engine.on("notify", this.onAdd);
        }
    }

    componentWillUnmount() {
        const { engine } = this.props;
        if (engine) {
            engine.off("notify", this.onAdd);
        }
    }

    onAdd(noti) {
        const { list } = this.state;
        ++this.nextIndex;
        list.unshift(<Notification key={"notify-"+ this.nextIndex} context={noti} />);
        while(list.length > 20) {
            list.pop();
        }

        this.setState({ list });
    }

    render() {
        const { list } = this.state;
        return (
        <div style={styles.notifications}>
            {
                list && list.map((value) => value)
            }
            <div style={styles.gradient}/>
        </div>
        )
    }
}
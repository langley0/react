import React from "react";

const styles = {
    bar: {
        position: "relative",
        textAlign: "center",
        border: "1px solid #EEE",
        userSelect: "none",
        width: 240,

        position:"absolute",
        left: 70,
        top: 0,
    },

    hp: {
        position: "absolute",
        backgroundColor: "#eee8",
        overflow: "hidden",
        height: "100%",
        top: 0,
        left: 0,
        width: "100%",
    },
}


export default class HpBar extends React.Component {
    static defaultProps = {
        hp: 1,
        maxhp: 1,
    }

    constructor(props) {
        super(props);

        this.state = {
            current: this.props.hp,
        };

        this.target = this.props.hp;
    }

    componentWillReceiveProps() {
        if (this.target !== this.props.hp) {
            this.target = this.props.hp;

            if (this.timer === undefined) {
                this.timer = setInterval(this.update.bind(this), 10);
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = undefined;
    }

    update(){
        const vel = 0.005; 
        let hp = this.state.current
        let target = this.target;
        const maxhp = this.props.maxhp;

        if (hp > target) {
            // 감소
            hp -= maxhp * vel;
            hp = Math.max(hp, target);
        } else if (hp < target) {
            // 증가
            hp += maxhp * vel;
            hp = Math.min(hp, target);
        } else {
            // 정지
            clearInterval(this.timer);
            this.timer = undefined;
        }

        this.setState({ current: hp });
    }

    render() {
        const { hp, maxhp } = this.props;
        let hpStyle = Object.assign({}, styles.hp);
        hpStyle.width = ((this.state.current / maxhp) * 100).toFixed(2) + "%";

        return (
            <div style={styles.bar}> 
                <div style={hpStyle } />
                <span>{hp}</span>
            </div>
        )
    }
}
import React from "react";
import ReactDOM from "react-dom";

import Game from './game';

const Mode = {
    easy: {
        width : 9, 
        height: 9,
        bombs: 10,
    },

    medium: {
        width : 16, 
        height: 16,
        bombs: 40,
    },

    large: {
        width : 30, 
        height: 16,
        bombs: 99,
    },
};

const styles = {
    button: {
        width: 80,
        height: 40,
        margin: 10,
        fontSize: 15,
        border: "3px solid #bdbdbd",
        borderRadius: 20,
        background: "#fefefe",
        color: "#7b7b7b",
        fontWeight: "bold",
        fontFamily: "Consolas, monospace",
    }
};

class Base extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mode: "easy",
            ...Mode.easy
        };
    }

    changeMode(mode) {
        this.setState({ mode, ...Mode[mode]});
    }

    render() {
        const { width, height, bombs, mode } = this.state;
        const buttonStyle = {...styles.button};
        const selected = Object.assign(buttonStyle, { background: "rgb(112,146,190)", color: "white"})
        return (
            <div style = {{ background: "rgb(112,146,190)", minHeight: "100vh",}}>
                <div style={{display: 'flex', justifyContent:"center", background:'rgb(112,146,190)', padding: 30}}>
                    <button style={mode === "easy" ? styles.button: selected } onClick={this.changeMode.bind(this, 'easy')} >쉬움</button>
                    <button style={mode === "medium" ? styles.button : selected } onClick={this.changeMode.bind(this, 'medium')}>중간</button>
                    <button style={mode === "large" ? styles.button : selected } onClick={this.changeMode.bind(this, 'large')}>어려움</button>
                </div>
                <Game width={width} height={height} bombs={bombs}/>
            </div>
        );
    }
}

ReactDOM.render(
    (
        <Base/>
    ),
    document.getElementById("root")
);
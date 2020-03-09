import React from "react";

const styles = {
    panel: {
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        
        backgroundColor: "#222",
        color: "#ddd",

        border: "2px solid #ddd",
        
        padding: 20,
        width: 350,

        alignItems: "center",
    },

    screen: {
        position: "absolute",
        left: 0,
        top: 0,

        background: "#000a",
        width: "100%",
        height: "100%",
    },

    description: {
        position: "relative",
        paddingBottom: 15,
    },

    button: {
        position: "relative",
        textAlign: "center",
        padding: "5px 10px",
        float: "left",
        marginLeft: 10,
        marginRight: 10,
        width: 122,
        border: "1px solid #ddd",
    }
}

export default class Dialog extends React.Component {
    render() {
        const { description, buttons } = this.props;
        const lines = description ? description.split("\n") : [];
        console.log(lines, description);
        return (
        <div style={styles.screen}>
            <div style={styles.panel}>
                <div>
                    { lines.map((value, index) => <div key={"line-"+index} style={styles.description} >{value}</div> )}
                </div>
                <div>
                    { buttons &&  buttons.map((value, index) => (<div key={"dialog-button-"+ index} style={styles.button}>{value}</div>)) }
                </div>
            </div>
        </div>);
    }
}
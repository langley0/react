import React from "react";

const styles = {
    notification: {
        marginBottom: 10,
    },

    notifications: {
        background: "inherit",
        position: "absolute",
        overflow: "hidden",
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
    render() {
        const { context } = this.props;
        return (<div style={styles.notification}>{context}</div>);
    }
}

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            list: ["클릭을 하였다", "클릭을 하였다", "클릭을 하였다", "클릭을 하였다", "클릭을 하였다", "클릭을 하였다;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;매우긴문장매우긴문장매우긴문장매우긴문장매우긴문장"]
        };
    }

    render() {
        const { list } = this.state;
        return (
        <div style={styles.notifications}>
            {
                list && list.map((value, index) => <Notification key={"nofi-"+index} context={value} />)
            }
            <div style={styles.gradient}/>
        </div>
        )
    }
}
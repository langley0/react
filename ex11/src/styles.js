const styles = {
    root: {
        backgroundColor: "#272823",
        color: "#eee",
        padding: 20,
        fontSize: 16,
    },
    container: {
        position: "relative",
        border: "1px solid #eee",
        padding: "5px 10px",
        cursor: "default",
        userSelect: "none",
        width: 200,

        legend: {
            position: "absolute",
            backgroundColor: "#272823",
            left: 8,
            top: -13,
        },

        row: {
            position: "relative",
        },

        key: {
            clear: "both",
            float: "left",
        },

        value: {
            float: "right",
        },

        clear: {
            clear: "both",
        },

        tooltip: {
            position: "absolute",
            width: 160,
            backgroundColor: "black",
            border: "1px solid #555",
            zIndex: 999,
            boxShadow: "-1px 3px 2px #111",
            padding: "2px 5px",
            left: 8,
            top: 30,
        }
    },


    button: {
        legend: {
            position: "relative",
            backgroundColor: "#272823",
            top: -5,
        },

        container: {
            position: "relative",
            padding: "5px 10px",
            cursor: "default",
            userSelect: "none",
        },

        button: {
            position: "relative",
            textAlign: "center",
            border: "1px solid #EEE",
            padding: "5px 10px",
            marginBottom: 5,
            cursor: "pointer",
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
}

export default styles;
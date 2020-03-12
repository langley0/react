import React from "react";

const styles = {
    tab: {
        width: 200,
    },

    headers: {
        left: 0,
    },

    header: {
        display: "inline-block",
        cursor: "pointer",
        marginRight: 20,
    },

    headerActive: {
        textDecoration: "underline",
    },

    content: {
        marginTop: 20,
    }
}

class Header extends React.Component { 
    render() {
        const{ active, onClick, children } = this.props;
        let style = Object.assign({}, styles.header);
        if (active) {
            style = Object.assign(style, styles.headerActive);
        }

        return <div style={style} onClick={onClick}>{children}</div>
    }
}

export default class Tab extends React.Component {
    constructor(props) {
        super(props);

        const { children } = this.props;
        let activeTab = null;
        if (children && children.length > 0) {
            activeTab = children[0].props.label;
        }

        this.state = { activeTab: activeTab };
    }
    onClick(label) {
        this.setState({ activeTab: label });
    }

    render() {
        const { children }  = this.props;
        const { activeTab } = this.state;
        return (
            <div style={styles.tab}>
                <div style={styles.headers}>
                    { children.map(child => {
                        const { label } = child.props;
                        return <Header 
                        key={label} 
                        active = { label === activeTab }
                        onClick={this.onClick.bind(this, label)}>{label}</Header>
                    })}
                </div>
                <div style={styles.content}>
                    { children.map(child=> {
                        if (child.props.label !== activeTab) return undefined;
                        return child.props.children;
                    })}
                </div>
            </div>
        );
    }
}
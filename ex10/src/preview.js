import React from "react";
import ReactDOM from "react-dom";

const styles = {
    pane: {
        display: "flex",
    },
    iframe: {
        width: "100%",
        height: "100%",
        overflow: "auto",
    },
}

export default class Preview extends React.Component {

    setContentRef(el) {
        this.iframe = el;
    }

    renderFrame() {
        const doc = this.iframe.contentWindow.document;

        const tf = () => {
            if (doc.body === null) {
                setTimeout(tf.bind(this), 1);
            } else {
                ReactDOM.render(React.createElement(this.props.app, null), doc.getElementById("root"));
            }
        }
        tf();
    }

    componentDidMount() {
        const doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write(this.props.html);
        doc.close();
    }

    componentDidUpdate() {
        this.renderFrame();
    }

    render() {
        return <div style={styles.pane}>
            <iframe 
        title="Preview"
        sandbox="allow-forms allow-scripts allow-modals allow-popups allow-presentation allow-same-origin"
        style={styles.iframe}
        ref={this.setContentRef.bind(this)}
        />
        </div>;
    }
}
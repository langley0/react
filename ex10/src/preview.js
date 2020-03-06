import React from "react";
import sandbox from "./sandbox";

const styles = {
    pane: {
        flex: 1,
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

                //this.iframe.contentWindow.eval(this.props.code);
                if(this.props.code) {
                    this.iframe.contentWindow.postMessage({type:"execute", code: this.props.code })
                }
            }
        }
        tf();
    }

    componentDidMount() {
        const doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write(this.props.html);
        doc.write(`<script>(${sandbox.toString()})(); </script>`);
        doc.close();

        this.renderFrame();
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
import React from "react";
import ReactDOM from "react-dom";

import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "./oceanic.css";
import "codemirror/mode/jsx/jsx.js";
import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/addon/edit/matchtags.js";

import * as babel from "@babel/standalone";

import Preview from "./preview";

const styles = {
    pane: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },

    tabs: {
        display: "flex",
        minHeight: 32,
        backgroundColor: "rgb(21,21,21)",
        boxShadow: "rgb(36,36,36) 0px -1px 0px inset",
    },

    tabMenu: {
        display: "inline-flex",
        padding: 8,
    },

    tab: {
        display: "inline-flex",
        alignItems: "center",
        paddingLeft: 8,
        color: "rgb(153,153,153)",
        fontSize: "0.875rem",
        cursor: "pointer",
        padding: "0px 32px 0px 18px",
    },

    tabSelected: {
        color: "rgb(255,255,255)",
        borderBottom: "1px solid rgb(108, 199, 246)",
    },
}

class Tabs extends React.Component {

    onClick(index, value) {
        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(index, value);
        }
    }

    render() {
        const { items, selected } = this.props;
        return (
            <div style={styles.tabs}>
                <div style={styles.tabMenu}></div>
                {
                    items.map((v, i) => {
                        const tabStyle = {};
                        Object.assign(tabStyle, styles.tab);
                        if (i === selected) {
                            Object.assign(tabStyle, styles.tabSelected);
                        }

                        return (
                            <div
                                style={tabStyle}
                                key={"tab-item-" + i}
                                onClick={this.onClick.bind(this, i, v)}
                            >{v}</div>
                        );
                    })
                }
            </div>
        );
    }
}

class EditorPane extends React.Component {
    constructor(props) {
        super(props);

        this.editor = null;
        this.codeMirror = null;

        this.state = {
            selectedIndex: 0,
        };
    }

    componentDidMount() {
        this.codeMirror = CodeMirror(this.editor, {
            lineNumbers: true,
            theme: "oceanic",
            matchTags: { bothTags: true },
            scrollbarStyle: "null",
        });

        if (this.props.onChange) {
            this.codeMirror.on("change", this.props.onChange);
        }

        this.onSelect(this.state.selectedIndex);
    }

    onSelect(index) {
        const file = this.props.files[index];
        this.setState(() => {
            this.codeMirror.setValue(file.value);
            this.codeMirror.setOption("mode", file.language);

            return { selectedIndex: index };
        });
    }

    render() {
        const { selectedIndex } = this.state;
        return (
            <div style={styles.pane}>
                <Tabs items={this.props.files.map(v => v.fileName)}
                    selected={selectedIndex}
                    onSelect={this.onSelect.bind(this)} />
                <div ref={ref => this.editor = ref}>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);




        this.files = [
            {
                fileName: "index.js",
                language: "jsx",
                value:
                    `
class App extends React.Component {
render() {
    return (
<div>
<h1>다음과 같은 기술이 사용되었습니다</h1>
<h2>CodeMirror Editor</h2>
<h2>Babel runtime transform</h2>
<h2>Custom Live Preview</h2>
</div>
);
    }
}

ReactDOM.render(
    (
        <App />
    ),
    document.getElementById("root")
);
`
            },
            {
                fileName: "index.html",
                language: "htmlmixed",
                value:`<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1">
        <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    </head>
    <body >
        <div id="root"></div>
    </body>
</html>
`
            },
        ];


        // 파일결과를 프리뷰에 넘겨준다
        this.state = {
            preview: {
                html: this.files[1].value,
                app: null,
            },
        }

        this.libraryStatus = null;
    }


    onChange(cm) {
        this.updateScript(cm.getValue());
    }

    updateScript(script) {
        try {

            const babelConfig = {
                presets: ["es2015", "react"],
            }

            const code = babel.transform(script, babelConfig).code;
            this.setState({ preview: { code: code }});
        } catch (e) {
            this.setState({ preview: { app: function () { return <div>{e.message}</div>; } } });
        }
    }

    render() {
        const { preview } = this.state;
        return (
            <div>
                <EditorPane
                    files={this.files}
                    onChange={this.onChange.bind(this)} />
                <Preview html={preview.html} code={preview.code} />
            </div>
        );
    }
}

ReactDOM.render(
    (
        <App />
    ),
    document.getElementById("root")
);
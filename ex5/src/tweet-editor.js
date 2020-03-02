import React from "react";
import { Editor, EditorState, CompositeDecorator } from "draft-js";

const styles = {
    root: {
        fontSmoothing: "antialiased",
        margin: "40px auto",
        width: "100%",
        maxWidth: 900,
    },
    editor: {
        border: "1px solid #ddd",
        cursor: "text",
        fontSize: 16,
        minHeight: 40,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: "center"
    },
    handle: {
        color: "rgba(98, 177, 254, 1.0)",
        direction: "ltr",
        uncodeBidi: "bidi-override",
    },
    hashtag: {
        color: "rgba(95, 184, 138, 1.0)",
    }
}

const HANDLE_REGEX = /@[\w|ㄱ-ㅎ가-힣]+/g;
const HASHTAG_REGEX = /#[\w|ㄱ-ㅎ가-힣\u0590-\u05ff]+/g;

function findWidthRegex(regex, contentBlock, callback) {
    const text = contentBlock.getText();
    let matchArr, start;
    while((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

function handleStrategy(contentBlock, callback) {
    findWidthRegex(HANDLE_REGEX, contentBlock, callback);
}

function hashtagStrategy(contentBlock, callback) {
    findWidthRegex(HASHTAG_REGEX, contentBlock, callback);
}

class HandleSpan extends React.Component {
    render() {
        return (
            <span 
                style={styles.handle}
                data-offset-key={this.props.offsetKey}>
                {this.props.children}
            </span>
        );
    }
}

class HandleHashTagSpan extends React.Component {
    render() {
        return (
            <span
                style={styles.hashtag}
                data-offset-key={this.props.offsetKey}
            >
                {this.props.children}
            </span>
        );
    }
}



export default class TweetEditor extends React.Component {
    constructor(props) {
        super(props);

        const compositeDecorator = new CompositeDecorator([
            {
                strategy: handleStrategy,
                component: HandleSpan,
            },
            {
                strategy: hashtagStrategy,
                component: HandleHashTagSpan,
            }
        ]);

        this.state = {
            editorState: EditorState.createEmpty(compositeDecorator),
        };

        this.focus = this.focus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.logState = this.logState.bind(this);
    }

    focus() {
        this.refs.editor.focus();
    }

    onChange(editorState) {
        this.setState({editorState});
    }

    logState() {
        console.log(this.state.editorState.toJS());
    }

    render() {
        return (
            <div style={styles.root}>
                <div>
                <h1>연습프로젝트5.1) 트위터 스타일 에디터</h1>
                <p># 와 @ 태그를 인식합니다 </p>
                </div>
                <div style={styles.editor} >
                    <Editor 
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        ref="eidtor"
                        spellCheck={true}
                    />
                </div>
                <input
                    onClick={this.logState}
                    style={styles.button}
                    type="button"
                    value="로그 출력" />
            </div>
        );
    }
}

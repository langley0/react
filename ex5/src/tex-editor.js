import React from 'react';
import {Editor, EditorState, RichUtils, AtomicBlockUtils, SelectionState, Modifier} from 'draft-js';
import { Map } from 'immutable';
import katex from 'katex';
import 'katex/dist/katex.css';

const styles = {
    root: {
        fontSmoothing: "antialiased",
        margin: "40px auto",
        width: "100%",
        maxWidth: 900,
    },
    editor: {
        border: "1px solid #e1e1e1",
        cursor: "text",
        fontSize: 18,
        minHeight: 40,
        padding: 30,
    },

    insert: {
        backgroundColor: "#faa",
        border: "1px solid #a00",
        borderRadius: 3,
    },

    tex: {
        backgroundColor: "#fff",
        cursor: "pointer",
        margin: "20px auto",
        padding: 20,
        transition: "background-color 0.2s fade-in-out",
        userSelect: "none",
    },

    activeTex: {
        color: "#888",
    },

    panel: {
        fontWeight: 200,
    },

    panelTextArea: {
        border: "1px solid #e1e1e1",
        display: "block",
        fontSize: 14,
        height: 110,
        margin: "20px auto 10px",
        outline: "none",
        padding: 14,
        resize: "none",
        boxSizing: "border-box",
        width: 500,
    },

    normalButton: {
        backgroundColor: "#fff",
        border: "1px solid",
        borderColor: "#0a0",
        cursor: "pointer",
        fontSize: 16,
        fontWeight: 200,
        margin: "10px auto",
        padding: 6,
        borderRadius: 3,
        width: 100,
    },
    invalidButton: {
        borderColor: "#aaa",
        color: "#999",
        marginLeft: 8,
    },
}


class KatexBlock extends React.Component {
    update() {
        katex.render(
            this.props.content,
            this.refs.container,
            {displayMode: true},
        );
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps, revState)  {
        if (prevProps.content !== this.props.content) {
            this.update();
        }
    }

    render() {
        return <div ref="container" onClick={this.props.onClick} />
    }
}

class TeXBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            editMode: false,
            invalidTeX: false,
            texValue: null,
        };

        this.onClick = this.onClick.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
    }

    onClick() {
        if (this.state.editMode) { 
            return;
        }

        this.setState({
            editMode: true,
            texValue: this.getValue()
        }, this.startEdit.bind(this));
    }

    startEdit() {
        this.props.blockProps.onStartEdit(this.props.block.getKey());
    }

    getValue() {
        return this.props.contentState
        .getEntity(this.props.block.getEntityAt(0))
        .getData()['content'];
    }

    onValueChange(evt) {
        const value = evt.target.value;
        let invalid = false;
        try {
            katex.__parse(value);
        } catch (e) {
            invalid = true;
        } finally {
            this.setState({
                invalidTeX: invalid,
                texValue: value,
            });
        }
    }

    save() {
        const entityKey = this.props.block.getEntityAt(0);
        const newContentState = this.props.contentState.mergeEntityData(
            entityKey,
            { content: this.state.texValue },
        );
        this.setState({
            invalidTeX: false,
            editMode: false,
            texValue: null,
        }, this.finishEdit.bind(this, newContentState));
    };

    finishEdit(newContentState) {
        this.props.blockProps.onFinishEdit(
            this.props.block.getKey(),
            newContentState,
        );
    };
  
    remove() {
        this.props.blockProps.onRemove(this.props.block.getKey());
    };

    render() {
        let texContent = null;
        if (this.state.editMode) {
            if (this.state.invalidTeX) {
                texContent = "";
            } else {
                texContent = this.state.texValue;
            }
        } else {
            texContent = this.getValue();
        }
        
        let texStyles = styles.tex;
        if (this.state.editMode) {
            texStyles = { ...texStyles, ...styles.activeTex };
        }

        let editPanel = null;
        if (this.state.editMode) {
            const buttonStyle = { 
                ...styles.normalButton, 
                ...(this.state.invalidTeX ? styles.invalidButton : {}),
            };

            editPanel = 
            <div style={styles.panel}>
                <textarea 
                    style={styles.panelTextArea}
                    onChange={this.onValueChange}
                    ref="textarea"
                    value={this.state.texValue}
                />
                <div style={{textAlign:"center"}}>
                    <button 
                        style={buttonStyle}
                        disabled={this.state.invalidTeX}
                        onClick={this.save}
                    >
                        {this.state.invalidTeX ? '오류' : "저장"}
                    </button>
                    <button style={styles.normalButton} onClick={this.remove}>
                        삭제
                    </button>
                </div>
            </div>
        }

        return (
            <div style={texStyles}>
                <KatexBlock content={texContent} onClick={this.onClick} />
                {editPanel}
            </div>
        );
    }
}

class ImageBlock extends React.Component {

}


let count = 0;
const examples = [
    '\\int_a^bu\\frac{d^2v}{dx^2}\\,dx\n' +
    '=\\left.u\\frac{dv}{dx}\\right|_a^b\n' +
    '-\\int_a^b\\frac{du}{dx}\\frac{dv}{dx}\\,dx',
  
    'P(E) = {n \\choose k} p^k (1-p)^{ n-k} ',
  
    '\\tilde f(\\omega)=\\frac{1}{2\\pi}\n' +
    '\\int_{-\\infty}^\\infty f(x)e^{-i\\omega x}\\,dx',
  
    '\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} =\n' +
    '1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}}\n' +
    '{1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }',
];

const modifier = {
    insertTeXBlock: function (editorState) {
        const contentState = editorState.getCurrentContent();
        const nextFormula = count++ % examples.length;
        const contentStateWithEntity = contentState.createEntity(
            "TOKEN",
            "IMMUTABLE",
            { content: examples[nextFormula] },
        );

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
     
        return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, 'tex');
    },

    removeTeXBlock: function (editorState, blockKey) {
        const content = editorState.getCurrentContent();
        const block = content.getBlockForKey(blockKey);
      
        const targetRange = new SelectionState({
            anchorKey: blockKey,
            anchorOffset: 0,
            focusKey: blockKey,
            focusOffset: block.getLength(),
        });

        const withoutTeX = Modifier.removeRange(content, targetRange, 'backward');
        const resetBlock = Modifier.setBlockType(
            withoutTeX,
            withoutTeX.getSelectionAfter(),
            'unstyled',
        );
      
        const newState = EditorState.push(editorState, resetBlock, 'remove-range');
        return EditorState.forceSelection(newState, resetBlock.getSelectionAfter());
    },

    addImage: function(editorState, url, extraData) {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            "IMAGE",
            "IMMUTABLE",
            { ...extraData, src: url },
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
            editorState,
            entityKey,
            'image'
        );
        return EditorState.forceSelection(
            newEditorState,
            newEditorState.getCurrentContent().getSelectionAfter()
        );
    }
}

export default class TexEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            liveTeXEdits: Map(),
        };

        this.blockRenderer = this.blockRenderer.bind(this);
        this.focus = this.focus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.insertTeX = this.insertTeX.bind(this);
    }

    blockRenderer(block) {
        if (block.getType() === "atomic") {
            const subType = block.getText();
            if (subType === "tex") {
                return {
                    component: TeXBlock,
                    editable: false,
                    props: {
                        onStartEdit: (blockKey) => {
                            const liveTeXEdits = this.state.liveTeXEdits;
                            this.setState({liveTeXEdits: liveTeXEdits.set(blockKey, true)})
                        },
                        onFinishEdit: (blockKey, newContentState) => {
                            const liveTeXEdits = this.state.liveTeXEdits;
                            this.setState({
                                liveTeXEdits: liveTeXEdits.remove(blockKey),
                                editorState:EditorState.createWithContent(newContentState),
                            });
                        },
                        onRemove: (blockKey) => {
                            this.removeTeX(blockKey);
                        }
                    }
                };
            } else {
                return {
                    component: ImageBlock,
                    editable: false,
                };
            }
        }

        return null;
    }

    focus() {
        this.refs.editor.focus();
    }

    onChange(editorState) {
        this.setState({editorState});
    }

    handleKeyCommand(command, editorState)  {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    insertTeX() {
        this.setState({
            liveTeXEdits: Map(),
            editorState: modifier.insertTeXBlock(this.state.editorState),
        });
    }

    removeTeX(blockKey) {
        const { editorState, liveTeXEdits} = this.state;
        this.setState({
            liveTeXEdits: liveTeXEdits.remove(blockKey),
            editorState: modifier.removeTeXBlock(editorState, blockKey),
        });
    }

    render() {
        return (
            <div>
                <div style={styles.root}>
                    <div>
                        <h1>연습프로젝트5.2) 수학 공식 에디터 </h1>
                        <p>
                            문장과 수학공식을 함께 입력해보세요
                        </p>
                    </div>
                    <button onClick={this.insertTeX} style={styles.insert}>
                        {'새로운 공식 추가'}
                    </button>
                    <div style={styles.editor} onClick={this.focus}>
                        <Editor 
                            blockRendererFn={this.blockRenderer}
                            handleKeyCommand={this.handleKeyCommand}
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                             readOnly={this.state.liveTeXEdits.count()}
                            ref="editor"
                        /> 
                    </div>
                    
                </div>
            </div>
        );
    }

}
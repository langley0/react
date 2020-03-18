import React from "react";
import Node from "./node";
import { dispatch, on, off } from "./dispatch";

const listStyle = {
    color: "#faa",
    cursor: "pointer",
};

const listHoverStyle = {
    textDecoration: "underline",
}
class ParagraphItem extends React.Component<{onClick:()=>void}, { hover: boolean}> {
    constructor(props: any) {
        super(props);

        this.state = { hover: false };
    }

    onMouseOver() {
        this.setState({ hover: true });
    }

    onMouseOut() {
        this.setState({ hover: false });
    }

    render() {
        const { children, onClick } = this.props;
        let style = Object.assign({}, listStyle);
        if (this.state.hover) {
            style = Object.assign(style, listHoverStyle);
        }
        return (
            <div style={{ marginTop: 40 }}>
            <span style ={style}
            onClick={onClick}
            onMouseOver={this.onMouseOver.bind(this)}
            onMouseOut={this.onMouseOut.bind(this)}
            >{children}</span>
            </div>
        )
    }
}

type Props =  {
    model: Paragraph,
    list: { label:Node, onClick: ()=>void }[],
    title: string,
};

type State = {
    invalidated: boolean,
}

class ParagraphView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            invalidated: false,
        };

        this.forceUpdate = this.forceUpdate.bind(this);
    }

    forceUpdate() {
        this.setState((prev) => {
            return { invalidated: !prev.invalidated };
        });
    }
    
    componentDidMount() {
        on("update(paragraph)", this.forceUpdate);
    }

    componentWillUnmount() {
        off("update(paragraph)", this.forceUpdate);
    }
    render() {
        console.log('render paragraph');

        const { children, list, title }  = this.props;
        if (children) {
            return (<React.Fragment>
                <div style={{borderBottom:"1px solid #fff", marginBottom: 20}}>{title}</div>
                { children } 
                { list.map((item, index) => {
                    return <ParagraphItem key={"listkey-" + index} onClick={item.onClick}>{item.label.render()} </ParagraphItem>; 
                }) }
            </React.Fragment>)
        } else {
            return null;
        }
    }
}

type ActionFunction = (node: Paragraph) => void;

export default class Paragraph extends Node {
    private list: {label: Node, onClick: ()=>void}[] = [];
    private actions: ActionFunction[] = [];
    private title: string = "";

    constructor(private name: string) {
        super();
    }

    setTitle(title: string) {
        this.title = title;
    }

    addListItem(label: Node, onClick: ()=>void) {
        this.list.push({ label, onClick });
        dispatch("update(paragraph)");
    }

    addAction(action: ActionFunction) {
        this.actions.push(action);
    }

    render() {
        // 시작할때 action 을 모두 실행한다
        this.actions.forEach(action => action(this));

        // render 객체를 반환한다
        return <ParagraphView model={this} title={this.title} list={this.list}>{ 
            this.children.map((child, index)=>child.render("node-key-"+ index)) }
            </ParagraphView>;
    }
}
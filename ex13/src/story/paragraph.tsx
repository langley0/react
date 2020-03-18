import React from "react";
import Node from "./node";

const listStyle = {
    color: "#aaa",
    cursor: "pointer",
};

const listHoverStyle = {
    color: "#fff",
    
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
            <div style={{ marginTop: 10, marginLeft: 15 }}>
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
    list: { label:Node, onClick: ()=>void }[],
    title: string,
};

class ParagraphView extends React.Component<Props> {
    render() {
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
    }

    addAction(action: ActionFunction) {
        this.actions.push(action);
    }

    render() {
        // 시작할때 action 을 모두 실행한다
        this.actions.forEach(action => action(this));

        // render 객체를 반환한다
        return <ParagraphView title={this.title} list={this.list}>{ 
            this.children.map((child, index)=>child.render("node-key-"+ index)) }
            </ParagraphView>;
    }
}
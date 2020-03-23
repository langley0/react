import React from "react";
import Node from "./node";
import { dispatch, on, off } from "../story/dispatch";
import VM from "../vm";


class Link extends React.Component<{src: Node}, {clicked: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = {
            clicked: false
        };

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        if (!this.state.clicked) {
            this.setState(prev => {
                const { src } = this.props;
                if (prev.clicked === false) {
                    const target = src.attributes["target"];
                    dispatch(`go(${target})`, target);
                    return { clicked : true };
                } else {
                    return prev;
                }
            });
        }
    }

    render() {
        const { src }  = this.props;
        const { clicked } = this.state;

        let style: any = { textDecoration: "underline" , color: "#fff", cursor:"pointer" };
        if (clicked) {
            style = {}
        }

        return (
            <span style={style} onClick={this.onClick}>{
                renderText(src)
            }</span>
        )
    }
} 

class Em extends React.Component<{ src: Node }> {
    children: React.Component[] = [];
    
    render() {
        const { src }  = this.props;
        return (
            <em>{
                renderText(src)
            }</em>
        )
    }
}

class Strong extends React.Component<{ src: Node }> {
    children: React.Component[] = [];
    
    render() {
        const { src }  = this.props;
        return (
            <strong>{
                renderText(src)
            }</strong>
        )
    }
}


class Text extends React.Component<{ src: Node }> {
    render() {
        const { src }  = this.props;
        return <span>{renderText(src)}</span>
    }
}


class Paragraph extends React.Component<{ src: Node }> {
    render() {
        const { src }  = this.props;
        return <p>{
            <span>{renderText(src)}</span>
        }</p>
    }
}

class Select extends React.Component<{ src: Node }> {
    render() {
        const { src }  = this.props;
        return <div>
            <Link src={src}/>
        </div>
    }
}

function renderText(node: Node) {
    return [
    node.value,
    ...node.children.map(child => {
        if (child.type === "text") {
            return <Text src={child}/>
        } else if (child.type === "strong") {
            return <Strong src={child}/>
        } else if (child.type === "em") {
            return <Em src={child}/>
        } else if (child.type === "link") {
            return <Link src={child}/>
        } else {
            return null;
        }
    })];
}

class Block extends React.Component<{ src: Node }> {
    render() {
        const { src }  = this.props;
        console.log(src);
        return (
            <div>{
                src.children.map(child => {
                    if (child.type === "paragraph") {
                        return <Paragraph src={child} />
                    } else if (child.type === "hr") {
                        return <hr/>
                    } else if (child.type === "select") { 
                        return <Select src={child} />
                    } else {
                        return null;
                    }
                })
            }</div>
        )
    }
}

type Props = {
    src: Node,
    vm: VM,
}

export class Page extends React.Component<Props,  { seen: string[] }> {
    constructor(props: Props) {
        super(props);

        this.linkTo = this.linkTo.bind(this);
        // default 프랍이 있으면 default 를 우선으로 한다.
        // 없다면... 곤란;;
        this.state = {
            seen: ["_default_"]
        };

    }

    componentDidMount() {
        // block 링크에 대해서 dispatch 를 한다
        const { src } = this.props;
        for(const child of src.children) {
            if (child.type === "block") {
                on(`go(${child.value})`, this.linkTo);
            }
        }
    }
 
    componentWillUnmount() {
        const { src } = this.props;
        for(const child of src.children) {
            if (child.type === "block") {
                off(`go(${child.value})`, this.linkTo);
            }
        }
    }

    linkTo(value: string) {
        
        this.setState(prev => {
            prev.seen.push(value);
            return prev;
        })
    }

    findChild(value: string) {
        const { src } = this.props;
        for(const child of src.children) {
            if (child.value === value) {return child };
        }
        return null;
    }

    render() {
        // 노출된 순서대로 block 을 표시한다
        const { src } = this.props;
        const { seen } = this.state;
        const title = src.attributes["title"];

        return (
        <div style={{color:"#bbb"}}>
            <div>{title}</div>
            {
            
            seen.map(name => {
                const child = this.findChild(name);
                if (child && child.type === "block") {
                    return <Block src={child}/>
                } else {
                    return null;
                }
            })
        }</div>
        );
    }
}

export class Story extends React.Component<Props, { page: string }> {
    constructor(props: Props) {
        super(props);

        this.linkTo = this.linkTo.bind(this);
        // default 프랍이 있으면 default 를 우선으로 한다.
        // 없다면... 곤란;;
        this.state = {
            page: "intro",
        };

    }

    componentDidMount() {
        // block 링크에 대해서 dispatch 를 한다
        const { src } = this.props;
        for(const child of src.children) {
            if (child.type === "page") {
                on(`go(${child.value})`, this.linkTo);
            }
        }
    }

    componentWillUnmount() {
        const { src } = this.props;
        for(const child of src.children) {
            if (child.type === "page") {
                off(`go(${child.value})`, this.linkTo);
            }
        }
    }

    findChild(value: string) {
        const { src } = this.props;
        for(const child of src.children) {
            if (child.value === value) {return child };
        }
        return null;
    }

    linkTo(value: string) {
        this.setState(prev => {
            if (prev.page !== value) {
                return { page: value};
            } else {
                return null;
            }
        })
    }

    render() {
        const { vm } = this.props;
        // 노출된 순서대로 block 을 표시한다
        const { page } = this.state;
        const child = this.findChild(page)

        return (
        <div>{
            child ?  <Page key={"page" + child.value }src={ child } vm={vm} /> : null
        }</div>
        );
    }
}
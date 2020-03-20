import React from "react";
import Node from "./node";

// vm 은 어디서 가져와야 하나?
// 고민해보자

function render(node: Node) {
    const context = () => {
        return [node.value, ...node.children.map(child => render(child))];
    };

    if (node.type === "text") {
        return <span>{context()}</span>
    } else if (node.type === "strong") {
        return <strong>{context()}</strong>
    } else if (node.type === "em") {
        return <em>{context()}</em>
    } else if (node.type === "block") {
        return <div>{context()}</div>;
    } else if (node.type === "paragraph") {
        return <div style={{marginBottom: 15}}>{context()}</div>;
    } else if (node.type === "link") {
        return <span style={{cursor:"pointer", textDecoration:"underline"}}>{context()}</span>
    } else if (node.type === "embed") {
        return <span style ={{color:"red"}}>{node.value}</span>
    }
     else {
         return null;
     }
}

export function renderPage(page: Node) {
    // 페이지를 렌더링해야한다
    const block = page.children[0];
    // default 이어야 한다
    if (block.type !== "block") {
        throw new Error("invliad node : not block but " + block.type);
    }

    // block 의 child 를 순서래도 그린다
    return (<div> {
        block.children.map(child => render(child))
    }</div>);
    
}
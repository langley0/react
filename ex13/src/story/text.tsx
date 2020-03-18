import React from "react";
import Node from "./node";

export default class Text extends Node {
    constructor(private text: string) {
        super();
    }

    getText(): string {
        return this.text;
    }
    
    render(key?: string) {
        return <span key={key}>{this.text}</span>
    }
}

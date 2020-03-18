import React from "react";
import Node from "./node";

export default class NewLine extends Node {
    render(key?: string) {
        return <br key={key}/>;
    }
}

export default class Node {
    public children: Node[] = [];
    constructor(public type: string, public value: string) {}

    toString(indent: string = "") {
        let output = this.value ? `${indent}<${this.type}:${this.value.length > 15 ? this.value.substring(0, 10) + "..." : this.value}>` : `${indent}<${this.type}>`;
        this.children.forEach(child => {
            output = output + "\n" + child.toString(indent + "  ");
        })
        return output;
    }

}
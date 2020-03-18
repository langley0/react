export default abstract class Node {
    protected children:Node[] = [];
    
    getText() {
        return "";
    }

    addNode(node: Node )  {
        this.children.push(node);
    }
    getChildren() {
        return this.children;    
    }

    mounted() {
        this.children.forEach(child => {
            child.mounted();
        });
    }

    abstract render(key?: string): React.ReactNode;
}

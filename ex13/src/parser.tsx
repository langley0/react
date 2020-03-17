import React from "react";
import Dispatcher from "./dispatcher";

let labels: any = {};

const dispatcher = new Dispatcher();

interface Node {
    render(key?: string): React.ReactNode;
}

class Text implements Node {
    constructor(private text: string) {
    }

    render(key?: string) {
        return <span key={key}>{this.text}</span>
    }
}

class Label implements Node {
    constructor(private id: string, private value?: string) { }

    render(key?: string) {
        let initialValue = this.value;
        const eventName = `label(${this.id})`;

        const Label: React.FC = function () {
            if (initialValue) {
                // 컨테이너를 초기화한다
                labels[eventName] = initialValue;
            } else {
                // 컨테이너에서 값을 가져온다
                initialValue = labels[eventName];
            }

            const [text, setText] = React.useState<string>(initialValue || "");

            React.useEffect(() => {
                dispatcher.on(eventName, (value: string) => { setText(value) })
                return () => {
                    dispatcher.off(eventName, (value: string) => {  })
                };
            }, [])

            return (
                <span>{text}</span>
            );
        }

        return <Label key={key}/>;
    }
}

class Replace implements Action{
    constructor(private id: string, private newValue: string) {} 
    run() {
        const eventName = `label(${this.id})`;
        dispatcher.dispatch(eventName, this.newValue);
    }
}

class Hyperlink implements Node {
    constructor(private text: string, private value: Action) {
    }

    render(key?: string) {
        const onClick = function (value: Action) {
            return function() {
                value.run();
            }
        }
        
        return <span key={key} style={{cursor:"pointer", textDecoration:"underline"}}onClick={onClick(this.value)}>{this.text}</span>
    }
}

class NewLine implements Node {
    render(key?: string) {
        return <br key={key}/>;
    }
}

/*class Strong implements Node {
    public children: Node[] = [];
    
    render(key?: string) {
        return <span key={key}>{
            this.children.map((child,index) => {child.render("key-strong-" + index) })    
        }</span>;
    }
}*/

type ParagraphProps =  {
    list: string[],
};

type ParagraphListItemProps = {
    text: string,
}

class ParagraphListItem extends React.Component<ParagraphListItemProps> {
    render() {
        const { text } = this.props;
        return <div>{text}</div>
    }
}

class ParagraphUI extends React.Component<ParagraphProps> {
    render() {
        const { children, list }  = this.props;
        if (children) {
            return (<React.Fragment>
                { children } 
                { list.length > 0 ? list.map(item => <ParagraphListItem text={item}/>) : null }
            </React.Fragment>)
        } else {
            return null;
        }
    }
}

class Paragraph implements Node {
    private list: string[] = [];
    private children: Node[] = [];

    constructor(private name: string) {
    }

    addNode(node: Node) {
        this.children.push(node);
    }

    addListItem(text: string) {
        this.list.push(text);
    }

    render() {
        return <ParagraphUI list={this.list}>{ this.children.map((child, index)=>child.render("node-key-"+ index)) }</ParagraphUI>;
    }
}


type StoryProps = {
    story: Story,
}

type StoryState = {
    paragraphName: string,
}

class StoryUI extends React.Component<StoryProps, StoryState> {
    constructor(props: StoryProps) {
        super(props);

        this.state = {
            paragraphName: "시작",
        }

        this.onClickLink = this.onClickLink.bind(this);
    }

    onClickLink(value: string) {
        this.setState({ paragraphName: value });
    }

    componentDidMount() {
        dispatcher.on("hyperlink", this.onClickLink);
    }

    componentWillUnmount() {
        dispatcher.off("hyperlink", this.onClickLink);
    }

    render() {
        const { paragraphName } = this.state;
        const { story } = this.props;
        const paragraph = story.getParagraph(paragraphName);
        return paragraph.render();
    }
}

class Story {
    private title: string = "";
    private start: string = "";
    private paragraphes: { [name: string]: Paragraph } = {};
    public dispatcher = dispatcher;

    addParagraph(name: string) {
        const paragraph = new Paragraph(name);
        this.paragraphes[name] = paragraph;
        return paragraph;
    }

    getParagraph(name: string) {
        return this.paragraphes[name];
    }

    render() {
        return <StoryUI story={this} />;
    }
}

function matchRegex(regex: { [key: string]: RegExp }, inputText: string) {
    type RegexKeyType = keyof typeof regex;
    const result: { [key in RegexKeyType]?: RegExpExecArray | null } = {}
    for(const key in regex) {
        result[key] = regex[key].exec(inputText);
    }
    return result;
}

interface Action {
    run(): void;
}

class linkTo implements Action {
    constructor(private name: string) {

    }
    run() {
        // 여기서 dispatch 가 필요하다
        dispatcher.dispatch("hyperlink", this.name);
    }
}


function parseHyperlink(text: string) {
    const index = text.indexOf("]");
    if (index >= 0) {
        const displayText = text.substring(1, index);
        // 이후 문장을 찾는다
        const regex = /^:\s*\((.*)?\)/;
        const match = regex.exec(text.substring(index+1));
        if (match) {
            const action = match[1].trim();
            let node: Node;

            if (action.startsWith("@replace")) {
                const replacer = action.substring(9);
                const eq = replacer.indexOf("=");
                if (eq >= 0) {
                    const id = replacer.substring(0, eq);
                    const value = replacer.substring(eq + 1);
                    node = new Hyperlink(displayText, new Replace(id, value));
                } else {
                    throw new Error("@replace 에는 대입문이 필요합니다")
                }
            } else {
                // 일반 텍스트이다
                node = new Hyperlink(displayText, new linkTo(action));
            }
            
            return {
                offset: index + 1 + match[0].length,
                node: node,
            };
            
        } else {
            // 패러그래프 이동 링크이다
            const node = new Hyperlink(displayText, new linkTo(displayText));
            return {
                offset: index + 1,
                node: node,
            };
        }
    } else {
        // 일반 문장일 가능성이 크다
        return null;
    }
}

function parseStatement(text: string) {
    const end = text.indexOf("}");
    if (end >= 0) {
        const actions = text.substring(1, end).split(";");
        const result = actions.map(actionStr => {
            actionStr = actionStr.trim();
            if (actionStr.startsWith("@label:")) {
                const expr = actionStr.substring(7);
                const eq = expr.indexOf("=");
                if (eq >= 0) {
                    const labelName = expr.substring(0, eq);
                    const initialValue = expr.substring(eq+1, end);
                    // 초기값이 있는 id 선언
                    return new Label(labelName, initialValue);
                } else {
                    // 초기값이 없는 레이블 선언
                    return new Label(expr);
                }

            } else if (actionStr.startsWith("@replace:")) {
                return new NewLine();
            } else {
                // 비어있는 경우는 무엇일까?
                // empty node 를 반환해야한다
                return new NewLine();
            }
        });

        return {
            offset: end + 1,
            nodes: result
        }
    }
    return null;
}

export function parser(text: string) {
    const lines = text.replace(/\r/g, "").split("\n");
    let lineCount = 0;

    const regex = {
        paragraph: /^\[(.*)\]:$/,
        list: /^\*(.*)$/,
    };
    
    const story = new Story();

    let paragraph: Paragraph|null = null;
    let firstLine =  true;

    const result = lines.every(function (line) {
        const match = matchRegex(regex, line);
        if (match.paragraph) {
            paragraph = story.addParagraph(match.paragraph[1]);
            firstLine = true;
        } else if (match.list) {
            if (!paragraph) {
                console.log(`에러: 라인 ${lineCount}: Paragraph 를 찾을 수 없어  ${match.list[1]} 아이템을 추가할 수 없습니다`);
                return false;
            }

            // 패러그래프가 있을때 하나의 list 선택지를 가질 수 있다
            paragraph.addListItem(match.list[1]);
        } else {
            if (!paragraph) {
                console.log(`에러: 라인 ${lineCount}: Paragraph 를 찾을 수 없어 문장을 추가할 수 없습니다`);
                return false;
            }

            if (firstLine) {
                firstLine = false;
            } else {
                // 이전문장뒤에 한칸 띄어쓰기를  한다 <br> 태그를 위한 콤포넌트를 추가한다
                paragraph.addNode(new NewLine());
            }

            let currentNode = paragraph;

            // 일반 문장이다.
            // 일반 문장을 글자 단위로 파싱을 해야한다
            let position = 0;
            const textParts = [];

            while(position < line.length) {
                const character = line.charAt(position);
                if (character === "[") {
                    // get link
                    const result = parseHyperlink(line.substring(position));
                    if (result) {
                        // 앞의 문장을 text 로 추가하고 이어서 링크를 추가한다
                        currentNode.addNode(new Text(textParts.join("")));
                        currentNode.addNode(result.node);
                        
                        position += result.offset;
                        textParts.length = 0;
                    } else {
                        // 일반문장으로 인식한다
                        textParts.push(character);
                        ++position;
                    }

                } else if (character === "{") {
                    // statement
                    const result = parseStatement(line.substring(position));
                    if (result) {
                        // 앞의 문장을 text 로 추가하고 이어서 링크를 추가한다
                        currentNode.addNode(new Text(textParts.join("")));
                        result.nodes.forEach(node => currentNode.addNode(node));

                        position += result.offset;
                        textParts.length = 0;

                    } else {
                        // 일반문장으로 인식한다
                        textParts.push(character);
                        ++position;
                    }
                } else if (character === "*") {
                    // 나중에 bold 같은것을 추가하도록 하자
                } else {
                    textParts.push(character);
                    ++position;
                }
            }

            // 남은 문장을 text 로 추가한다
            if (textParts.length > 0) {
                currentNode.addNode(new Text(textParts.join("")));
            }
        }
        return true;
    });

    if (result) {
        return story;
    } else {
        return null;
    }
}

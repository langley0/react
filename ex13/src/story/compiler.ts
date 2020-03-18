import Story from "./story";
import Node from  "./node";

import Paragraph from "./paragraph";
import Hyperlink from "./hyperlink";
import Text from "./text";
import Variable from "./variable";
import NewLine from "./newline";

import { dispatch }  from  "./dispatch";

function matchRegex(regex: { [key: string]: RegExp }, inputText: string) {
    type RegexKeyType = keyof typeof regex;
    const result: { [key in RegexKeyType]?: RegExpExecArray | null } = {}
    for(const key in regex) {
        result[key] = regex[key].exec(inputText);
    }
    return result;
}

function parseVariable(text: string): [string, string?]  {
    // single expression 을 처리한다
    text = text.trim();
    // attribute  이다
    const eq = text.indexOf("=");
    if (eq >= 0) {
        const id = text.substring(0, eq);
        const expr = text.substring(eq + 1);
        return [id, expr];
    } else {
        return [text];
    }
}

function parseNode(text: string): Node {
    text = text.trim();
    if (text[0] === "#") {
        const result = parseVariable(text.substring(1));
        const name = result[0];
        const expr = result[1];

        return new Variable(name, expr);
    } else {
        return new Text(text);
    }
}

function parseLinkAction(text: string, parent?: Node): () => void {
    text = text.trim();
    const result: any[] = [];

    text.split(",").forEach(text => {
        text = text.trim();
        if (text.startsWith("@set")) {
            // 변수 설정이다
            const match = /^@set\s*#([\w]*)?\s*=\s*(.*)?$/.exec(text);
            if (match) {
                const id = match[1];
                const value = match[2];
                const eventName = "replace("+id + ")";
                result.push(() => { 
                    dispatch(eventName, value); 
                });
            } 
        }  else if (text.startsWith("@select")) {
            // 패러그래프에 select 함수를 추가한다
            const match = /^\[(.*)?\]:\((.*)?\)$/.exec(text.substring(7).trim());
            console.log(match);
            if (match) {
                const label = parseNode(match[1]);
                const onClick = parseLinkAction(match[2]);
                result.push(function () {
                    (parent as Paragraph).addListItem(label, onClick);
                });
            }
        }
        else {
            // 단순링크이다
            const node = parseNode(text);
            result.push(() => {
                console.log("click", text);
                const target = node.getText();
                if (target) {
                    dispatch("paragraph", target);
                }
            });
        }
    });

    if (result.length === 0) {
        return () => {};
    }
    else if (result.length === 1) {
        return result[0];
    } else {
        // 액션리스트 전체를 실행하는 함수를 만든다
        return function () {
            result.forEach(action => {
                action();
            });
        };
    }
    
}

function compileText(node: Node, text: string) {
    
    // 일반 문장이다.
    // 일반 문장을 글자 단위로 파싱을 해야한다
    let position = 0;

    const textParts: string[] = [];
    const handleTextBlock = () => {
        if (textParts.length > 0) {
            node.addNode(new Text(textParts.join("")));
            textParts.length = 0; // 초기화한다
        }
    };

    while(position < text.length) {
        const character = text.charAt(position);
        if (character === "\\") {
            // escape 문자이다
            // 다음문자를 그대로 text 에 추가한다
            if (text.length > position + 1) {
                textParts.push(text.charAt(position + 1));
                ++position;
            }
            ++position;
        }
        else if (character === "[") {
            handleTextBlock();
            let begin = position + 1;
            let end = text.indexOf("]", begin);
            const labelText = text.substring(begin, end);
            const label = parseNode(labelText);
            if (text[end + 1] === ":") {
                // () 를 찾는다
                // 원래는 nest 를 찾아야 하는데 일단 귀찬으니 패스
                let nestCount = 1;
                begin = text.indexOf("(", end + 1) + 1;
                end = begin + 1;
                while(end < text.length) {
                    const posAt = text.charAt(end);
                    if (posAt === "(") {
                        ++nestCount;
                    } else if (posAt === ")") {
                        --nestCount;
                        if (nestCount === 0) {
                            break;
                        }
                    }
                    ++end;
                }

                const actionStr= text.substring(begin, end);
                console.log(actionStr);
                const clickAction = parseLinkAction(text.substring(begin, end), node);
                const link = new Hyperlink(label, clickAction);
                node.addNode(link);
            } else {

                const clickAction = () => {
                    const target = label.getText();
                    if (target) {
                        dispatch("paragraph", target);
                    }
                };

                const link = new Hyperlink(label, clickAction);
                node.addNode(link);
            }

            position = end + 1;

        } else if (character === "{") {
            // expression 을 선언하는 경우이다
            handleTextBlock();
            
            const index = text.indexOf("}", position);
            if(index <= -1) {
                // link 구문을 찾을수 없다
                throw new Error("] 를  찾을 수 없습니다");
            } 

            // expression 을 가져온다
            // expression 도 결국 node 가된다.
            // 이부분은 나중에 일단 돌아가는지 보고..
            const expr = text.substring(position + 1, index);
            const exprNode = parseNode(expr);
            position = index + 1;
            node.addNode(exprNode);

        } else if (character === "*") {
            // 나중에 bold 같은것을 추가하도록 하자
        } else {
            textParts.push(character);
            ++position;
        }
    }
    handleTextBlock();
}

function compileAction(root: Paragraph, text: string) {
    // action 을 컴파일한다
    // action 은 @set, @title 등이 있다

    text = text.trim();
    if (text.startsWith("@set")) {
        // 속성값을 세팅한다
        // id 값을 가져온다
        const result = parseVariable(text.substring(4));
        if (result && result[0] && result[1]) {
            const variable = result[0];
            const expr = result[1];
            console.log("action: set", variable, expr);
        } else {
            throw new Error("@set 액션 구문을 파싱할 수 없습니다");
        }
    } else if (text.startsWith("@title")) {
        const titleExpr = text.substring(6).trim();
        // 타이틀을 변경한다
        root.addAction((node: Paragraph) => {
            node.setTitle(titleExpr);
        });
    }
}

export function compile(text: string) {
    const lines = text.replace(/\r/g, "").split("\n");
    let lineCount = 0;

    const regex = {
        paragraph: /^\[(.*)\]:$/,
        list: /^\*(.*)$/,
        action: /^(@.*)$/,
    };
    
    const story = new Story();
    // 오류가 나지 않도록 기본 패러그래프를 준비해둔다
    let paragraph: Paragraph;
    let inText = false;

    const result = lines.every(function (line) {
        try {
            ++lineCount;
            const match = matchRegex(regex, line);

            if (match.paragraph) {
                paragraph = story.addParagraph(match.paragraph[1]);
                inText = false;
            } else if (match.list) {
                // 패러그래프가 있을때 하나의 list 선택지를 가질 수 있다
                const expr = match.list[1].trim();
                const listMatch = /^\[(.*)?\]:\((.*)?\)$/.exec(expr);
                if (listMatch) {
                    paragraph.addListItem(parseNode(listMatch[1]), parseLinkAction(listMatch[2]));
                }
            } else if (match.action) {
                // 문장의 시작이 @로시작하면 action 이 된다. 패러그래프가 시작할때 이 액션들은 바로 실행된다
                compileAction(paragraph, match.action[1]);
            }
            else {
                if (inText || line !== "") {
                    // 텍스트가 진행중이라면 줄바뀜을 추가한다
                    if (inText) {
                        paragraph.addNode(new NewLine());
                    } else {
                        inText = true;
                    }
                    // 일반 텍스트이다
                    compileText(paragraph, line);
                }
            }
            return true;
        } catch(e) {
            console.error(`라인 ${lineCount} : ` + e.message);
            return false;
        }
    });

    if (result) {
        return story;
    } else {
        console.error("story 생성 실패");
        return null;
    }
}

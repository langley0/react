import Node from "./node";

const blockRules = {
    page: /^\[\[\s*(.*)\s*\]\]\s*$/, // [[ PAGE NAME ]]
    block: /^\[\s*(.*)\s*\]\s*$/,  // [ BLOCK NAME ]
    code: /^ {4}(.*)$/, // 코드 블럭, 텍스트가 읽히는 순간 실행되면 화면에 표시를 하지 않는다
    hr: /^-{3,}\s*$/, // 횡 라인
    select: /^\*\s*\[\s*(.*)\s*\]\(\s*(.*)\s*\)\s*/, // 선택문이다. 링크와 동작이 동일하다
    empty: /^\s*$/, // 빈줄은 줄바꿈으로 표시된다.
};

const inlineRules = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~])/,
    link: /^\[\s*(.*?)\s*\]\s*\(\s*(.*?)\s*\)/, // 텍스트 
    embed:  /^\{\s*([^}]+)\s*\}/, // { 코드 블럭 } , 코드 실행결과를 출력한다
    strong: /^\*\*(([^*])([^*]|\*[^*])*?)\*\*(?!\*)/,
    em: /^\*(([^*])([^*]|(\*\*))*?)\*(?!\*)/,
    text: /^([^[*{\\]+)/, // \[{* 가 아닌 문자열은 일반 텍스트이다
}

function parseRules(regex: { [key: string]: RegExp }, inputText: string) {
    type RegexKeyType = keyof typeof regex;
    const result: { [key in RegexKeyType]?: RegExpExecArray | null } = {}
    for(const key in regex) {
        result[key] = regex[key].exec(inputText);
    }
    return result;
}


function parseText(parent: Node, src: string) {
    // 하나의 텍스트 블락을 파싱합니다
    src = src.replace(/\s*\n/, " ");
    let text = "";

    const addText = () => {
        if (text) {
            // 텍스트영역을 추가한다
            parent.children.push(new Node("text", text));
            text = "";
        }
    }
    
    while(src.length > 0) {
        const match = parseRules(inlineRules, src)
        if (match.escape) {
            text += match.escape[1];
            src = src.substring(match.escape[0].length);
        } else if (match.link) {
            addText();
            const link = new Node("link", match.link[1]);
            link.attributes["target"] = match.link[2];
            parent.children.push(link);
            src = src.substring(match.link[0].length);
        } else if (match.embed) {
            addText();
            parent.children.push(new Node("embed", match.embed[1]));
            src = src.substring(match.embed[0].length);
        } else if (match.strong) {
            addText();

            
            const strongNode = new Node("strong", "");
            parseText(strongNode, match.strong[1]);
            parent.children.push(strongNode);
            src = src.substring(match.strong[0].length);
        } else if (match.em) {
            // 앞에 있는 문장을 다시 파싱합니다
            addText();
            
            const emNode = new Node("em", "");
            parseText(emNode, match.em[1]);
            parent.children.push(emNode);
            src = src.substring(match.em[0].length);
        } else if (match.text) {
            // 남아있는 것은 전부 일반 텍스트이다
            text += match.text[1];
            src = src.substring(match.text[0].length);
        } else {
            // 매칭되는 것이 없으면 일반 문자열로 취급한다
            text += src;
            src = "";
        }
    }

    addText();
}


export function compile(src: string) {
    src = src.replace("\r\n", "\n"); // DOS => UNIX
    src = src.replace("\r", "\n"); // MAC => UNIX
    src = src.replace("\t", "    "); // tab => space * 4

    const  story = new Node("story", "스토리 제목");

    let page: Node|null = null;
    let block: Node|null = null;
    let text: string = "";

    const addParagraph = () => {
        if (text) {
            // 줄바꿈은 공백으로 치환된다
            if(block) {
                text = text.trim().replace(/[\n]+/, " ");
                const textNode = new Node("paragraph", "");
                parseText(textNode, text);

                block.children.push(textNode);
                
            }
            text = "";
        }
    }

    src.split("\n").forEach(line => {
        const match = parseRules(blockRules, line);
        if (match.page) {
            addParagraph();
            page = new Node("page", match.page[1]);
            story.children.push(page);
            
            // 기본블럭을 만들어서 PAGE 진입시 엔트리포인트로 사용한다
            // 기본블럭을 오버라이드할수 있도록 만드는것은 나중에
            block = new Node("block", "_default_");
            page.children.push(block);
        }
        else if (match.block) {
            addParagraph();
            if (page) {
                block = new Node("block", match.block[1]);
                page.children.push(block);
            }
        }

        else if (match.code) {
            addParagraph();
            if (block) {
                const code = new Node("code", match.code[1]);
                block.children.push(code);
            }
        }

        else if (match.hr) {
            addParagraph();
            if (block) {
                const hr = new Node("hr", match.hr[1]);
                block.children.push(hr);
            }
        }
        else if (match.select) {
            addParagraph();
            if (block) {
                const select = new Node("select", match.select[1]);
                select.attributes["target"] = match.select[2];
                block.children.push(select);
            }
        }
        else if (match.empty) {
            addParagraph();

            if (block) {
                const empty = new Node("empty", "");
                block.children.push(empty);
            }
        } else {
            text += "\n" + line;
        }
    });

    addParagraph();
    return story;
}
import { Story, Section, Passage } from "./story";

function matchRegex(regex: { [key: string]: RegExp }, inputText: string) {
    type RegexKeyType = keyof typeof regex;
    const result: { [key in RegexKeyType]?: RegExpExecArray | null } = {}
    for(const key in regex) {
        result[key] = regex[key].exec(inputText);
    }
    return result;
}

interface Text {

}

class PlainText implements Text {
    constructor(public text: string) {

    }
}

interface Statement {

}

class LinkTo implements Statement {
    constructor(public type: string, public link: string) {

    }
}

class LinkText implements Text {
    constructor(public text: string, public statement: Statement) {

    }
}

class LabelText implements Text {
    constructor(public label: string, public initial?: string) {

    }
}

function startsWith(string: string, prefix: string): boolean {
    return string.substring(0, prefix.length) === prefix;
};

function parseLabel(statement: string) {
    const command = statement.substring(6);
    const eq = command.indexOf("=");
    if (eq === -1) {
        // label 만있는 경우이다.
        return new LabelText(command);
    } else {
        const label = command.substring(0, eq);
        const context = command.substring(eq + 1);

        return new LabelText(label, context);
    }
}

function parseStatement(statement: string): Text | null {
    if (startsWith(statement, "label:")) {
        return parseLabel(statement);
    } else {
        // 해석할 수 없는 문장을 plaintext 로 처리한다
        return null;
    }
}

function parseText(text: string) {
    const regex = {
        namedSectionLink: /\[\[([^\]]*?)\]\]\((.*?)\)/,
        sectinLink: /\[\[([^\]]*?)\]\]/,
        namedPassageLink: /\[([^\]]*?)\]\((.*?)\)/,
        passageLink: /\[([^\]]*?)\]/,
        statement: /{(.*?)}/,
    }

    const result: Text[] = [];

    const match = matchRegex(regex, text);
    // 가장 앞쪽에 있는 문장을 해석한다
    const found = Object.keys(match).reduce((prev, key) => {
        const result = match[key];
        if (result) {
            if (prev) {
                return prev.index > result.index ? result : prev;
            } else {
                return result;
            }
        } else {
            return prev;
        }
    }, null as RegExpExecArray | null);


    if (found) {
        // found 앞쪽에 있는 부분을 plaintext 로 입력한다
        if(found.index > 0) {
            result.push(new PlainText(text.substring(0, found.index)));
        }

        if (found === match.namedSectionLink) {
            const displayText = match.namedSectionLink[1];
            const statement = match.namedSectionLink[2];
            parseStatement(statement)


            // statement 를 해석한다
            result.push(new LinkText(text, text));

        } else if (found === match.sectinLink) {
            const text = match.sectinLink[1];
            result.push(new LinkText(text, text));
        } else if (found === match.statement) {
            // statement 를 해석한다
            //result.push(parseStatement(match.statement[0]))
        }

        // 이후 텍스트를 해석한다
        text = text.substring(found.index + found[0].length);
        result.concat(parseText(text));

    } else {
        result.push(new PlainText(text));
    }

    return result;
}

export function compile(text: string) {
    const filename = "[none]";
    const story = new Story();
    const lines = text.replace(/\r/g, "").split("\n");
    let lineCount = 0;

    let section: Section = story.addSection("_default", filename, 0);
    let passage: Passage | null = null;

    
    const regex = {
        section: /^\[\[(.*)\]\]:$/,
        passage: /^\[(.*)\]:$/,
        title: /^@title (.*)$/,
        js: /^(\t| {4})(.*)$/,
        replace: /^@replace (.*)$/,
    };

    const result = lines.every(function (line) {
        ++lineCount;
        const match = matchRegex(regex, line);

        if (match.section) {
            section = story.addSection(match.section[1], filename, lineCount);

        } else if (match.passage) {
            if (!section) {
                console.log(`에러: ${filename} 라인 ${lineCount}: 섹션을 찾을 수 없어  ${match.passage[1]} 경로를 추가할 수 없습니다`);
                return false;
            }

            passage = section.addPassage(match.passage[1], lineCount);

        } else if (match.title) {
            story.setTitle(match.title[1]);

        } else if (match.js) {
            if (!passage) {
                section.addJS(line);
            } else {
                passage.addJS(line);
            }

        } else if (match.replace) {
            let replaceAttribute = match.replace[1];
            const attributeMatch = /^(.*?)=(.*)$/.exec(replaceAttribute);
            if (attributeMatch) {
                // make link
                replaceAttribute = attributeMatch[1] + "=" + attributeMatch[2]; // 어떻게 ??
            }

        } else if (line.length > 0) {
            console.log(parseText(text));

            if (!passage) {
                // 패러그래프를 추가하고 각각의 문장을 넣는다
                // 실시간 계산도 하나의 속성으로 만들어보자
                section.addText(line);
            } else {
                passage.addText(line);
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
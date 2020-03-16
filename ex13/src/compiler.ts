import { Story, Section, Passage } from "./story";

const regex = {
    section: /^\[\[(.+)\]\]:$/,
    passage: /^\[(.+)\]:$/,
    title: /^@title (.+)$/,
    js: /^(\t| {4})(.*)$/,
};

type RegexKeyType = keyof typeof regex;

function matchRegex(line: string, untrimed: string) {
    const result: {
        section?: any,
        passage?: any,
        title?: any,
        js? : any,
    } = {};
    
    type IndexType = keyof typeof result;
    Object.keys(regex).forEach(key => {
        if (key === "js") {
            result[key as IndexType] = regex[key as RegexKeyType].exec(untrimed);
        } else {
            result[key as IndexType] = regex[key as RegexKeyType].exec(line);
        }
    });
    return result;
}


export function compile(text: string) {
    const filename = "[none]";
    const story = new Story();
    const lines = text.replace(/\r/g, "").split("\n");
    let lineCount = 0;

    let section: Section = story.addSection("_default", filename, 0);
    let passage: Passage | null = null;

    const result = lines.every(function (_line) {
        const line = _line.trim();
        ++lineCount;
        const match = matchRegex(line, _line);
        
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
        }
        else if (match.js) {
            if (!passage) {
                section.addJS(line);
            } else {
                passage.addJS(line);
            }
        }
        else if (line.length > 0) {
            if (!passage) {
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
import { Story, Section, Passage } from "./story";
import Dispatcher from "./dispatcher";

class Blackboard {
    public lastIf: boolean = false;
    private data: any;

    constructor(private dispatcher: Dispatcher) {
        this.data = {};
    }

    getValue(name: string): any {
        return this.data[name];
    }

    setValue(name: string, value: any) {
        this.data[name] = value;
        this.dispatcher.dispatch("replace", { label: name, text: value });
    }

    setSeen(name:string) {
        this.data[name] = true;
    }

    isSeen(name: string): boolean {
        return this.data[name];
    }
}

const operatorRegex = /([\w ]*)(=|&lt;=|&gt;=|&lt;&gt;|&lt;|&gt;)(.*)/;

function startsWith(string: string, prefix: string): boolean {
    return string.substring(0, prefix.length) === prefix;
};

class TextProcessor {

    static process(text: string, data: Blackboard) {
        const inst = new TextProcessor();
        return inst.process(text, data);
    }
   
    process(text: string, data: Blackboard) {
        let containUnprocessedSection = false;
        let open = text.indexOf("{");
        let close = -1;

        if (open > -1) {
            let nestCount = 1;
            let searchStart = open + 1;
            let finished = false;

            while(!finished) {
                const nextOpen = text.indexOf("{", searchStart);
                const nextClose = text.indexOf("}", searchStart);

                if (nextClose > -1) {
                    if (nextOpen> -1 && nextOpen < nextClose) {
                        nestCount ++;
                        searchStart = nextOpen + 1;
                    
                    } else {
                        nestCount --;
                        searchStart = nextClose + 1;
                        if (nestCount === 0) {
                            close = nextClose;
                            containUnprocessedSection = true;
                            finished = true;
                        }
                    }
                } else {
                    finished = true;
                }
            }
        }

        if (containUnprocessedSection) {
            const section = text.substring(open + 1, close);
            const value = this.processTextCommand(section, data);
            text = text.substring(0, open) + value + this.process(text.substring(close + 1), data);
        }

        return text;
    }

    
    processTextCommand(section: string, data: Blackboard) {
        if (startsWith(section, "if ")) {
            return this.processTextCommand_If(section, data);
        } else if (startsWith(section, "else ")) {
            throw new Error("not implemented yet");
        } else if (startsWith(section, "label:")) {
            return this.processTextCommand_Label(section, data);
        }
    }

    processTextCommand_If(section: string, data: Blackboard) {
        const command = section.substring(3); // "if " 를 제외한 나머지
        const colon = command.indexOf(":");
        if (colon === -1) {
            return ("{if " + command + "}"); // if 는 문장의 일부분이다
        }

        const text = command.substring(colon + 1);
        let condition = command.substring(0, colon).replace("<", "&lt;").replace(">", "&gt;");
        const match = operatorRegex.exec(condition);
        let result = false;

        if (match) {
            let lhs = match[1];
            const op = match[2];
            let rhs = match[3];

            if (startsWith(lhs, "@")){ lhs = data.getValue(lhs.substr(1)); }
            if (startsWith(rhs, "@")){ rhs = data.getValue(rhs.substr(1)); }

            if(op === "=") { result = (lhs == rhs); }
            else if(op === "&lt;&gt;") { result = (lhs != rhs); }
            else if(op === "&gt;") { result = (lhs > rhs); }
            else if(op === "&lt;") { result = (lhs < rhs); }
            else if(op === "&gt;=") { result = (lhs >= rhs); }
            else if(op === "&lt;=") { result = (lhs <= rhs); }
        } else {
            let TRUE = true;
            if (startsWith(condition, "not ")) {
                condition = condition.substring(4);
                TRUE = false;
            }

            if (startsWith(condition, "seen ")) {
                result = data.isSeen(condition.substring(5)) === TRUE;

            } else {
                const value = data.getValue(condition) || false;
                result = value === TRUE;
            }

            data.lastIf = result;
            const textResult = result ? this.process(text, data) : '';
            return textResult;
        }
    }


    processTextCommand_Label(section: string, data: Blackboard) {
        const command = section.substring(6);
        const eq = command.indexOf("=");
        if (eq === -1) {
            // label 만있는 경우이다. 그래도반환한다
            return `{${section}}`;
        }

        const label = command.substring(0, eq);
        const context = command.substring(eq + 1);

        // 데이터를 기록하고 label 로 변경한다
        data.setValue(label, this.process(context, data));
        return `{label:${label}}`;
    }
}
export default class Player {
    private section: Section | null = null;
    public dispatcher = new Dispatcher();
    public data: Blackboard;
    
    constructor(private story: Story) {
        this.data = new Blackboard(this.dispatcher);

        this.dispatcher.on("link", (data: {type: string, name: string}) => {
            if (data.type === "section") {
                this.go(data.name);
            } else if (data.type ==="passage") {
                this.passage(data.name);
            }
        });
    }

    begin() {
        this.go(this.story.getStart());
    }

    go(sectionName: string) {
        this.section = this.story.getSection(sectionName);
        if (this.section) {
            this.run(this.section);
            this.write(this.section.getTexts())
        }
    }

    passage(passageName: string) {
        if (this.section) { 
            const passage = this.section.getPassage(passageName);
            if (!passage) { return; }

            this.data.setSeen(passageName);

            this.run(passage);
            this.write(passage.getTexts());
        }
    }

    run(input: Section|Passage) {
        // clear

        // process attributes

        // run js
        const fn = input.getJSFunction();
        eval(fn)();
    }

    write(texts: string[]) {
        // 여기서 태그 프로세싱을 한다
        for(const text of texts) {
            // 프로세싱을 하고 그결과를 넘겨준다
            const processedText = TextProcessor.process(text, this.data);
            this.dispatcher.dispatch("write", processedText);
        }
    }
}
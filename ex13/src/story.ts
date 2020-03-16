export class Passage {
    private texts: string[] = [];
    private js: string[] = [];

    constructor(private name: string, private line: number) {
        
    }

    addText(line: string) {
        this.texts.push(line);
    }

    addJS(text: string) {
        this.js.push(text);
    }

    addAttribute() {

    }

    getTexts() {
        return this.texts;
    }

    getJSFunction() {
        return `(function() { ${this.js.join("\n") }})`;
    }
}

export class Section {
    private passages: { [name: string]: Passage } = {};
    private texts: string[] = [];
    private js: string[] = [];
    private attributes: string[] = [];

    constructor(
        private name: string, 
        private filename: string, 
        private line: number) {

    }

    addPassage(name: string, line: number) {
        const passage = new Passage(name, line);
        this.passages[name] = passage;
        return passage;
    }

    addText(text: string) {
        this.texts.push(text);
    }

    addJS(text: string) {
        this.js.push(text);
    }

    addAttribute(text: string) {
        this.attributes.push(text);
    }

    getPassage(name: string) {
        return this.passages[name] ;
    }

    getTexts() {
        return this.texts;
    }

    processTexts(processor: (input: string) => string) {
        this.texts = this.texts.map(text => processor(text));
    }

    getJSFunction() {
        return `(function() { ${this.js.join("\n") }})`;
    }
}

export class Story {
    private title: string = "";
    private start: string = "";
    private sections: { [name: string]: Section } = {};

    addSection(name: string, filename: string, line: number) {
        const section = new Section(name, filename, line);
        this.sections[name] = section;
        return section;
    }

    setTitle(title: string) {
        this.title = title;
    }

    getSection(section: string): Section {
        return this.sections[section];
    }

    getSections(): Section[] {
        return Object.keys(this.sections).map(key => this.sections[key]);
    }

    getStart() {
        if (this.start) {
            return this.start;
        } else {
            return Object.keys(this.sections)[0];
        }
    }
}

const isTag = (char: string) => { 
    return (char === "[" || char === "{" || char === "]" || char === "}" || char ==="*" || char==="`");
}

const isEscape = (char: string) => char === "\\";

enum TokenType {
    EOF, // 
    STRING,
    LPAREN, // (
    RPAREN, // )
    LBRACE, // {
    RBRACE, // }
    LBRACKET, // [
    RBRACKET, // ]
    COLON, // :
    ASTERISK, // *
    GRAVE, //`
}

class Token {
    constructor(private _type: TokenType, private _value: string = "") {}

    get type() {
        return this._type;
    }

    get value() {
        return this._value;
    }
}

class Lexer {
    private pos: number;
    private char: string | null;

    constructor(private text: string) {
        this.pos = 0;
        this.char = text.length > 0 ? this.text[0] : null;
    }

    private advance() {
        this.pos += 1;
        if (this.pos < this.text.length) {
            this.char = this.text[this.pos];
        } else {
            this.char = null;
        }
    }

    getString() {
        let quoted = false;
        let result = "";
        while(this.char !== null && (quoted || !isTag(this.char))) {
            if (this.char === "\"") {
                // 인용구 (" 로 감싸여져 있는 ") 안에는 tag 를 처리하지 않는다
                quoted = !quoted;
            } else if(isEscape(this.char)) {
                // esacpe 다음문자는 반드시 추가한다
                this.advance();
            }

            result += this.char;
            this.advance();
        }

        return new Token(TokenType.STRING, result);
    }

    getNextToken() {
        if (this.char !== null) {
            if (this.char === "{") {
                this.advance();
                return new Token(TokenType.LBRACE, "{");
            } else if (this.char === "}") {
                this.advance();
                return new Token(TokenType.RBRACE, "}");
            } else if (this.char === "[") {
                this.advance();
                return new Token(TokenType.LBRACKET, "[");
            } else if (this.char === "]") {
                this.advance();
                return new Token(TokenType.RBRACKET, "]");
            } else if (this.char === "*") {
                this.advance();
                return new Token(TokenType.ASTERISK, "*");
            } else if (this.char === "`") {
                this.advance();
                return new Token(TokenType.GRAVE, "`");
            } else {
                // 단어를 읽는다 white space 까지 모두 포함해서 읽어야 한다
                return this.getString();  
            }
        }

        return new Token(TokenType.EOF);
    }
}

abstract class ASTNode extends Object {
    abstract get type(): string;
}

class StringNode extends ASTNode {
    constructor(public value: string) {
        super();
    }

    get type() {
        return "string";
    }
}

class PageNode extends ASTNode {
    constructor(public value: string) {
        super();
    }

    get type() {
        return "page";
    }
}

class BlockNode extends ASTNode {
    constructor(public value: string) {
        super();
    }

    get type() {
        return "block";
    }
}

class PageLink extends ASTNode {
    constructor(public label: ASTNode, public target: ASTNode) {
        super();
    }

    get type() {
        return "pagelink";
    }
}

class BlockLink extends ASTNode {
    constructor(public label: ASTNode, public target: ASTNode) {
        super();
    }

    get type() {
        return "blocklink";
    }
}

class TextNode extends ASTNode {
    children: ASTNode[] = [];

    addChild(node: ASTNode) {
        this.children.push(node);
    }

    get type() {
        return "text";
    }
}

class BoldTextNode extends TextNode {
    get type() {
        return "bold";
    }
}

class ItalicTextNode extends TextNode {
    get type() {
        return "italic";
    }
}

class ScriptNode extends ASTNode {
    constructor(public value: string) {
        super();
    }

    get type() {
        return "script";
    }
}

class Parser {
    private token: Token;
    constructor(private lexer: Lexer) {
        this.token = lexer.getNextToken();
    }

    eat(type: TokenType): Token {
        const token = this.token;
        if (token.type === type) {
            this.token = this.lexer.getNextToken();
        } else {
            throw new Error(this.token.value + " is not type of " + type);
        }

        return token;
    }

    getLinkTarget() {
        if (this.token.type === TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const text = this.text(TokenType.RPAREN);
            this.eat(TokenType.RPAREN);
            return text;
        } 
        return null;
    }

    text(endToken?: TokenType): TextNode {
        const text = new TextNode();
        while(this.token.type !== TokenType.EOF) {
            if (this.token.type === endToken) {
                // 종료한다
                return text;
            }
            else if (this.token.type === TokenType.STRING) {
                const str = this.eat(this.token.type);
                text.addChild(new StringNode(str.value));
            } 
            else if (this.token.type === TokenType.LBRACKET) { 
                // link 입니다
                this.eat(TokenType.LBRACKET);
                if (this.token.type === TokenType.LBRACKET) {
                    // page link 입니다
                    this.eat(TokenType.LBRACKET);
                    const label = this.text(TokenType.RBRACKET);
                    this.eat(TokenType.RBRACKET);
                    this.eat(TokenType.RBRACKET);

                    let target = this.getLinkTarget() || label;
                    text.addChild(new PageLink(label, target));

                } else  {
                    const label = this.text(TokenType.RBRACKET);
                    this.eat(TokenType.RBRACKET);
                    let target = this.getLinkTarget() || label;

                    text.addChild(new BlockLink(label, target));
                }
                
                // 혹시 link option 이 존재한다면 별도로 처리해야한다.
            }
            else if (this.token.type  === TokenType.LBRACE) {
                // script 
                this.eat(TokenType.LBRACE);
                const script = this.eat(TokenType.STRING);
                this.eat(TokenType.RBRACE);

                text.addChild(new ScriptNode(script.value));
            } 
            else if (this.token.type === TokenType.ASTERISK) {
                this.eat(TokenType.ASTERISK);
                const nested = this.text(TokenType.ASTERISK);
                this.eat(TokenType.ASTERISK);
                const bold = new BoldTextNode();
                // text 를 bold text 로 변경 로 복사
                bold.children = nested.children.map(child=>child);
                text.addChild(bold);
            }
            else if (this.token.type === TokenType.GRAVE) {
                this.eat(TokenType.GRAVE);
                const nested = this.text(TokenType.GRAVE);
                this.eat(TokenType.GRAVE);
                const italic = new ItalicTextNode();
                // text 를 bold text 로 변경 로 복사
                italic.children = nested.children.map(child=>child);
                text.addChild(italic);
            }
            else {
                throw new Error("invalid token : " + this.token.value);
            }
        }
        return text;
    }

    parse() {
        // 문자의 시작이 [...] , 혹든 [[..]] 로 시작하는 경우는 레이블로 인식한다
        if (this.token.type === TokenType.LBRACKET) {
            this.eat(TokenType.LBRACKET);
            if (this.token.type === TokenType.LBRACKET) {
                // page label
                this.eat(TokenType.LBRACKET);
                const token = this.eat(TokenType.STRING);
                this.eat(TokenType.RBRACKET);
                this.eat(TokenType.RBRACKET);
                this.eat(TokenType.EOF); // 라인이 끝나야 한다

                return new PageNode(token.value);
                
            } else {
                // link label
                const token = this.eat(TokenType.STRING);
                this.eat(TokenType.RBRACKET);
                this.eat(TokenType.EOF);

                return new BlockNode(token.value);
            }
        } else{
            // 본문이다
            return this.text();
        }
    }
}


export default class story {
    compile(text: string) {
        text.split("\n").forEach(line => {
            const parser = new Parser(new Lexer(line));
            console.log(parser.parse());
        });
    }
}


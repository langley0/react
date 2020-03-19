const isWhitespace = (char: string) => char === " " || char === "\t" || char ==="\n";
const isWord = (char: string) => { return (char >= "0" && char <= "9") || (char >= "A" && char <= "z") || (char >= "가" && char <= "힣") || (char === "_"); }
const isEscape = (char: string) => char === "\\";
const isOperator = (char: string) => ["=",">","<","+","-","?",":",","].indexOf(char) >= 0;

enum TokenType {
    EOF, // 
    IDENTIFIER,//
    STRING, // "*" || single word
    //FUNCTION, // @word 
    LPAREN, // (
    RPAREN, // )
    LBRACE, // {
    RBRACE, // }
    LBRACKET, // [
    RBRACKET, // ]
    ASSIGNMENT, // =
    LESS, // <
    GREATER, // <
    LESSEQUAL, // <=
    GREATEREQUAL, // >=
    EQUAL, // ==
    QUESTIONMARK, // ?
    COLON, // :
    COMMA, // ,
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

const EOF = new Token(TokenType.EOF);
const LPAREN = new Token(TokenType.LPAREN, "(");
const RPAREN = new Token(TokenType.RPAREN, ")");
const LBRACE = new Token(TokenType.LBRACE);
const RBRACE = new Token(TokenType.RBRACE);
const LBRACKET = new Token(TokenType.LBRACKET);
const RBRACKET = new Token(TokenType.RBRACKET);

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

    getString(): Token {
        let result = "";
        this.advance();

        while(this.char !== null && this.char !== "\"") {
            if (isEscape(this.char)) {
                // 다음문자를 무조건 단어에 포함시킨다
                this.advance();
            }

            result += this.char;
            this.advance();
        }
        // 마지막 따옴표를 넘긴다
        this.advance();
        return new Token(TokenType.STRING, result);
    }

    getSingleWord(): string {
        let result = "";
        while(this.char !== null && isWord(this.char) && !isWhitespace(this.char)) {
            result += this.char;
            this.advance();
        }
        return result;
    }

    getFunction(): Token {
        this.advance(); // @ 는 스킵한다
        const keyword =  this.getSingleWord();
        return new Token(TokenType.STRING, "@" + keyword);
    }

    getOperator(): Token {
        let result = "";
        while(this.char !== null && isOperator(this.char)) {
            result += this.char;
            this.advance();
        }

        if (result === "=") {
            return new Token(TokenType.ASSIGNMENT, result);
        } else if (result === "?") {
            return new Token(TokenType.QUESTIONMARK, result);
        } else if (result === ":") {
            return new Token(TokenType.COLON, result);
        } else if (result === ">") {
            return new Token(TokenType.GREATER, result);
        } else if (result === ">=") {
            return new Token(TokenType.GREATEREQUAL, result);
        } else if (result === "<") {
            return new Token(TokenType.LESS, result);
        } else if (result === "<=") {
            return new Token(TokenType.LESSEQUAL, result);
        } else if (result === "==") {
            return new Token(TokenType.EQUAL, result);
        } else if (result === "<>") {
            return new Token(TokenType.EQUAL, result);
        } 
        else {
            throw new Error("해석할 수 없는 단어입니다 : " + result);
        }
    }

    getNextToken() {
        while(this.char !== null) {
            const char = this.char;
            if (isWhitespace(char)) { 
                // whtite space spkip
                this.advance();
            } else if (isWord(char)) {
                // get word
                const word = this.getSingleWord();
                if (Number.isNaN(Number(word))) {
                    return new Token(TokenType.IDENTIFIER, word);
                } else {
                    // 숫자는 문자열로 취급한다. (나중에 바꾸어야 할까??)
                    return new Token(TokenType.STRING, word);
                }

            } else if (char === "\"") {
                // 따옴표로 감싸져 있는 단어이다
                return this.getString();
            } else if (isOperator(char)) {
                return this.getOperator();
            }
            
            // 특수문자 처리
            else if (char === "@") {
                // 함수이다
                return this.getFunction();
            } else if (char === "(") {
                this.advance();
                return LPAREN;
            } else if (char === ")") {
                this.advance();
                return RPAREN;
            } else if (char === "{") {
                this.advance();
                return LBRACE;
            } else if (char === "}") {
                this.advance();
                return RBRACE;
            } else if (char === "[") {
                this.advance();
                return LBRACKET;
            } else if (char === "[") {
                this.advance();
                return RBRACKET;
            } else {
                throw new Error("token error : " + this.text.substring(this.pos));
            }
        }

        return EOF;
    }
}

abstract class ASTNode extends Object {
    abstract get type(): string;
}

class AssigmentNode extends ASTNode {
    constructor(public left: ASTNode, public right: ASTNode) {
        super();
    }

    get type() {
        return "assignment";
    }
}

class VariableNode extends ASTNode{
    constructor(public value: string) {
        super();
    }

    get type() {
        return "variable";
    }
}

class StringNode extends ASTNode {
    constructor(public value: string) {
        super();
    }

    get type() {
        return "string";
    }
}

class FunctionNode extends ASTNode {
    constructor(public name: ASTNode, public argument: ASTNode) {
        super();
    }
    
    get type() {
        return "function";
    }
}

class TenaryNode extends ASTNode {
    constructor(private _if: ASTNode, private _then: ASTNode, private _else: ASTNode) {
        super();
    }

    getIf() {
        return this._if;
    }

    getThen() {
        return this._then;
    }

    getElse() {
        return this._else;
    }

    get type() {
        return "tenary";
    }
}

class CompareNode extends ASTNode {
    constructor(public left:ASTNode, public op: Token, public right: ASTNode) {
        super();
    }

    get type() {
        return "compare";
    }
}
/*
class Chain extends AST {
    constructor(public prev:AST, public next: AST) {
        super();
    }

    get type() {
        return "chain";
    }
}*/


class Parser {
    private token: Token;
    constructor(private lexer: Lexer) {
        this.token = lexer.getNextToken();
    }

    parse() {
        return this.expr();
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


    private factor(): ASTNode {
        // variable 은 assignment 형태로 추가가 가능하다
        const token = this.token;
        if (token.type === TokenType.IDENTIFIER) {
            this.eat(TokenType.IDENTIFIER);
            return new VariableNode(token.value);
        } 
        else if (token.type === TokenType.STRING) {
            this.eat(TokenType.STRING);
            return new StringNode(token.value);
        } 
        else if (token.type === TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const node = this.expr();
            this.eat(TokenType.RPAREN);
            return node;
        } else {
            throw new Error("invalid token : " + this.token.value);
        }
    }

    private sentence(): ASTNode {
        let node = this.factor();
        if (this.token.type === TokenType.LPAREN) {
            // 함수 호출이다
            this.eat(TokenType.LPAREN);
            const arg = this.expr();
            this.eat(TokenType.RPAREN);
            return new FunctionNode(node, arg);
        }

        // 나중에 여기에 boolean operation 을 넣는다
        if (this.token.type === TokenType.GREATER || 
            this.token.type === TokenType.LESS ||
            this.token.type === TokenType.GREATEREQUAL  ||
            this.token.type === TokenType.LESSEQUAL ||
            this.token.type === TokenType.EQUAL) {

            // boolean express
            // token 을 중심으로 left, right 를 구한다
            const left = node;
            const op = this.eat(this.token.type);
            const right = this.sentence();

            return new CompareNode(left, op, right);
        } 

        // 그밖의 것은 다음과 같이 처리한다
        return node;
    }

    private expr(): ASTNode {
        // expr :   call || string || variable || assign || ( expr ) ||  tenary
        // tenary: expr ? expr : expr
        // call : name(arg, arg, args ..)
        // arg: expr
        // variable : identifier || string
        // assign: variable = expr

        let node = this.sentence();
        if (this.token.type === TokenType.QUESTIONMARK) {
            // 삼항연산자이다
            this.eat(TokenType.QUESTIONMARK);
            const _then = this.expr();
            this.eat(TokenType.COLON);
            const _else = this.expr();
            return new TenaryNode(node, _then, _else);
        }
        else if (this.token.type === TokenType.ASSIGNMENT) {
            // variable assignment 이다
            this.eat(TokenType.ASSIGNMENT);
            const value = this.expr();
            return new AssigmentNode(node, value);
        } 
        else {
            return node;
        }
    }
}

export default class Interpreter {
    private variables: { [key: string]: string } = {};
    private functions: { [key: string]: Function  }= {};
    
    regFunc(name: string, hook: Function) {
        this.functions[name] = hook;
    }

    visit(node: ASTNode): string {
        if (node.type === "chain") {
            
        } else if (node.type === "assignment") {
            const assign = node as AssigmentNode;
            const left = (assign.left as VariableNode);
            const varName = left.value;
            const value = this.visit(assign.right);
            this.variables[varName] = value;
            return value;
        } else if (node.type === "variable") {
            // variable 을 등록한다
            const v = node as VariableNode;
            return this.variables[v.value];
        } else if (node.type === "string") {
            const value = node as StringNode;
            return value.value;
        } else if (node.type === "tenary") {
            const tenary = node as TenaryNode;
            const condition = this.visit(tenary.getIf())
            if (condition === "true") {
                return this.visit(tenary.getThen());
            } else if (condition === "false") {
                return this.visit(tenary.getElse());
            } else {
                throw new Error(condition + " is not boolean value");
            }
        } else if (node.type === "compare") {
            const cp = node as CompareNode;
            console.log(node);
            let left: string | number = this.visit(cp.left);
            let right: string | number = this.visit(cp.right);
            
            const op = cp.op;
            
            console.log(left, right, op.value);

            const ln = Number(left);
            const rn = Number(right);
            if (!Number.isNaN(ln) && !Number.isNaN(rn)) {
                left = ln;
                right = rn;
            } 

            

            let result = false;
            // number 비교를 한다
            if (op.value === "<") { result = left < right; }
            if (op.value === "<=") { result = left <= right; }
            if (op.value === ">") { result = left > right; }
            if (op.value === ">=") { result = left >= right; }
            if (op.value === "==") { result = left === right; }
            if (op.value === "<>") { result = left !== right; }

            return result ? "true" : "false";
        } else if (node.type === "function") {
            const fnNode = node as FunctionNode;
            const name = this.visit(fnNode.name);
            const arg = this.visit(fnNode.argument);

            console.log(name, arg);

            const fnhook = this.functions[name];
            if (fnhook) {
                return fnhook(arg) as string;
            } else {
                throw new Error("invalid function name : " + name);
            }
        }

        return "";
    }


    eval(text: string) {
        const parser = new Parser(new Lexer(text));
        const tree = parser.parse();
        console.log(tree);
        // 바로 실행한다
        const result =  this.visit(tree);
        return result;
    }
}
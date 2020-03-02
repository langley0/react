import React from 'react';

const styles = {
    container: {
        width: 640,
        height: 460,
        overflow: 'auto',
        cursor: 'text',
        background: '#212121',
        backgroundSize :"cover",
    },

    context: {
        padding: 5,
        color: "white",
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', monospace",
        whiteSpace: "normal !important",
    },

    line: {
        lineHeight: "21px",
        margin: 0,
    },

    inputArea: {
        display: 'inline-flex',
        width: '100%'
    },

    prompt: {
        paddingTop: 3,
        margin: 0,
    },

    input: {
        width: "100%",
        color: "inherit",
        border: 0,
        background: "transparent",
        height: 22,
        outline: "none",
        padding: 0,
        margin: 0,
        fontSize: 'inherit',
        fontFamily: "Consolas, 'Courier New', monospace",
    }
};

const prompt = ">";

class Command {
    constructor() {
        this.commands = {};
    }

    register(command, handler) {
        this.commands[command] = handler;
    }

    run(command, ...args) {
        if (args.length <= 0) {
            alert("invalid argument");
        }

        const cmdArgs = args.slice(0, args.length - 1);
        const stdout = args[args.length - 1];

        const handler = this.commands[command];
        if (handler) {
            handler(...cmdArgs, stdout);
        } else {
            stdout(`'${command}' 명령을 찾을 수 없습니다`, {color: "red" });
        }
    }
}

function help(stdout) {
    const result = 
`┌─────────────────────┐
│   명령어 리스트 :    │
│    help             │
│    clear            │
│    box              │
│    camel            │
└─────────────────────┘
`;
    stdout(result);
}

function drawBox(stdout) {
    const result =  "┌───────────┐\n" +
    "│           │\n" +
    "│           │\n" +
    "│           │\n" +
    "│           │\n" +
    "└───────────┘";
    stdout(result);
}

function drawCamel(stdout) {
    const result =
'    ,,__\n' + 
`    ..  ..   / o._)                   .───.
   /──'/──\\  \\─'||        .────.    .'     '.
  /        \\_/ / |      .'      '..'         '─.
.'\\  \\__\\  __.'.'     .'          i─._
  )\\ |  )\\ |      _.'
 // \\\\ // \\\\
||_  \\\\|_  \\\\_
'──' '──'' '──'`;
    stdout(result);
}

const CLEAR_SCREEN_MESSAGE = "__CLEAR__SCREEN__";

function clearScreen(stdout) {
    stdout(CLEAR_SCREEN_MESSAGE);
}

class Line extends React.Component {
    render() {
        const text = this.props.text;
        return (
            <p style={styles.line} dangerouslySetInnerHTML={{__html: text}} />
        );
    }
}

class ScreenBuffer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.screen = [];
        this.validate = false;
    }

    isInvalidate() {
        return !this.validate;
    }

    validate() {
        return this.validate = true;
    }

    set(x, y, char) {
        const line = this.screen[y];
        if (line.length < x + 1) {
            line.concat(new Array(line.length - x + 1).map(() => ' '));
        }
        this.screen[y][x] = char;
        this.validate = false;
    }

    getStringArray() {
        const result = [];
        for(const line of this.screen) {
            result.push(line.join(''));
        }
        return result;
    }

    clear() {
        this.screen = [];
        this.validate = false;
    }

    print(text) {
        let isNewLine = true;
        // width 보다 큰 데이터를 전부 자른다
        const data = Array.from(text);

        let lineBuffer = [];
        for(let i = 0; i < data.length; ++i) {
            if (isNewLine) {
                lineBuffer = [];
                this.screen.push(lineBuffer);
                if (this.screen.length > this.height) {
                    this.screen.shift();
                }
                isNewLine = false;
            }

            const c = data[i];
            switch(c) {
                case '\n':
                    isNewLine = true;
                    break;
                case ' ':
                    lineBuffer.push('&nbsp;');
                    break;
                default:
                    lineBuffer.push(c);
                    if (lineBuffer.length >= this.width) {
                        isNewLine = true;
                    }
                    break;
            }
            
            
        }

        this.validate = false;
    }
}

export default class Terminal extends React.Component {
    constructor(props) {
        super(props);

        this.commands = new Command();
        this.commands.register("help", help);
        this.commands.register("clear", clearScreen);
        this.commands.register("box", drawBox);
        this.commands.register('camel', drawCamel);


        this.buffer = new ScreenBuffer(80, 20);
        this.onProcessingStdout = false;

        this.state = {
            lines: []
        }; 

        this.inputRef = React.createRef();

        this.focusTerminal = this.focusTerminal.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    componentDidMount() {
        this.stdout(
`React Exercise 06 - web Console
help 를 입력하시면 명령어 목록이 출력됩니다`);
        
    }

    focusTerminal() {
        this.inputRef.current.focus();
    }

    handleInput(event) {
        switch (event.key) {
            case 'Enter': this.processCommand(); break
            default: break;
          }
    }

    processCommand() {
        const input = this.inputRef.current.value;
        this.stdout(`${prompt} ${input}`);

        if (input) {
            const tokens = input.split(/(\\s+)/).filter(e => e.length > 0);
            if (tokens.length > 0) {
                const command = tokens[0];
                const args = tokens.slice(1);
                this.commands.run(command, ...args, (output) => {
                    this.stdout(output);
                    this.inputRef.current.value = '';
                });
            }
        }
    }

    stdout(message) {
        if (message === CLEAR_SCREEN_MESSAGE) {
            this.buffer.clear();
        } else {
            this.buffer.print(message);
        }
        const lines = this.buffer.getStringArray();
        this.setState({ lines: lines });
    }
    
    print() {
        return this.state.lines.map((value, index) => {
            return <Line key={index} text={value} />
        });
    }

    render() {
        return (
            <div style={{display: "flex", marginTop:20, justifyContent:"center"}}>
            <div style={styles.container}
                onClick={this.focusTerminal}>
                <div style={styles.context}>
                { this.print() }
                <div style={styles.inputArea }>
                    <p style={styles.prompt} >{prompt}&nbsp;</p>
                    <input 
                        ref={this.inputRef}
                        style={styles.input} 
                        type={"text"} 
                        maxLength={80 - 2}
                        autoComplete={"off"} 
                        spellCheck={false}
                        onKeyDown={this.handleInput}/>
                </div>
                </div>
            </div>
            </div>
        );
    }
}
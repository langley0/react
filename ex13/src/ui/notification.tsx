import React from "react";
import LinkText from "./linktext";
import LabelText from "./labeltext";

const styles = {
    notification: {
        marginBottom: 10,
        color: "#ddd",
    },
}

type Props = {
    dispatcher: any,
    data: any,
    context: string,
}

type State = {
    opacity: number,
    cooldown: { start: number, end: number } | null,
}

export default class Notification extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.updateOpacity = this.updateOpacity.bind(this);

        this.state = {
            opacity: 0,
            cooldown: null,
        }
    }

    componentDidMount() {
        const now = Date.now();
        this.setState({
            cooldown: {
                start: now,
                end: now + 300,
            }
        }, this.updateOpacity);           
    }

    updateOpacity() {
        const { cooldown }  = this.state
        if (!cooldown) { return; }

        const now = Date.now();
        if (now >= cooldown.end) {
            this.setState({ opacity: 1, cooldown: null });
        } else {
            const rate = (now - cooldown.start) /(cooldown.end - cooldown.start);
            this.setState({ opacity: rate });
            setTimeout(this.updateOpacity, 20);
        }
    }

    replaceLabel(expr: string) {
        const regex = /^([\w]*)\s*=\s*(.*)$/;
        const match = regex.exec(expr);
        if (!match) { return null };

        const label = match[1];
        const text = match[2];

        this.props.data.setValue(label, text);
    }

    onClick(type: string, name: string) {
        const { dispatcher } = this.props;
        // processing 을 한다
        const sections = name.split(",");
        let target = name;
        let first = true;
        sections.forEach(section => {
            section = section.trim();
            if (section.indexOf("@replace") === 0) {
                // label 을 교체한다
                // label + context 로 분리한다
                // attribte 설정과는 조금 다른가?
                this.replaceLabel(section.substring(9));
            } else {
                if (first) {
                    target = section;
                } else {
                    // attribute 설정으로 넘어간다
                }
            }
            first = false;
        });

        dispatcher.dispatch("link", {type, target});
    }

    renderText(text: string) {

        // [[ + DISPLAY TEXT + ]] + ( + SECTION NAME + )
        const namedSectionLinkRegex = /\[\[([^\]]*?)\]\]\((.*?)\)/;
        // [[ + SECTION_NAME +]]
        const unnamedSectionLinkRegex = /\[\[(.*?)\]\]/;
        // [ + DISPLAY TEXT + ] + ( + PASSAGE NAME+ )
        const namedPassageLinkRegex  = /\[([^\]]*?)\]\((.*?)\)/;
        // [ + PASSAGE NAME + ]
        const unnamedPassageLinkRegex = /\[(.*?)\]/;
        // {label: + LABEL }
        const labelRegex = /{label:(.*?)}/;

        
        const result: React.ReactNode[] =[];
        
        while(text.length > 0) {
            let selectedIndex = -1;
            const regexResult = [
                namedSectionLinkRegex.exec(text),
                unnamedSectionLinkRegex.exec(text),
                namedPassageLinkRegex.exec(text),
                unnamedPassageLinkRegex.exec(text),
                labelRegex.exec(text),
            ].reduce((prev, item, index, array) => {
                if (prev) {
                    if (item) {
                        if (prev.index > item.index) { 
                            selectedIndex = index;
                            return item;
                        } else {
                            return prev;
                        }
                    } else {
                        return prev;
                    }
                } else {
                    selectedIndex = index;
                    return item;
                }
            });


            if (regexResult) {
                if (selectedIndex < 4) {
                    let linkType = selectedIndex < 2 ? "section" : "passage";
                    let linkName = regexResult[2] ? regexResult[2] : regexResult[1];

                    result.push(<span key={"noti-key-"+ result.length}>{text.substring(0, regexResult.index)}</span>);
                    result.push(<LinkText key={"noti-key-"+ result.length} onClick={() => { this.onClick(linkType, linkName); }}>{regexResult[1]}</LinkText>);
                    text = text.substring(regexResult.index + regexResult[0].length);
                } else if (selectedIndex === 4) {
                    // 레이블
                    result.push(<span key={"noti-key-"+ result.length}>{text.substring(0, regexResult.index)}</span>);
                    result.push(<LabelText key={"noti-key-"+ result.length} label={regexResult[1]} data={this.props.data} dispatcher={this.props.dispatcher}/>);
                    text = text.substring(regexResult.index + regexResult[0].length);
                }

            } else {
                // 나머지를 span 에 넣는다
                result.push(<span key={"noti-key-"+ result.length} >{text}</span>);
                break;
            }
        }
        return result;
    }
    

    render() {
        const { context } = this.props;
        const { opacity } = this.state;

        let style = Object.assign({}, styles.notification);
        style = Object.assign(style, { opacity })
        return (<div style={style}>{this.renderText(context)}</div>);
    }
}

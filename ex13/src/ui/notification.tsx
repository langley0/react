import React from "react";
import LinkText from "./linktext";

const styles = {
    notification: {
        marginBottom: 10,
        color: "#ddd",
    },
}

type Props = {
    dispatcher: any,
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

    onClick(type: string, name: string) {
        const { dispatcher } = this.props;        
        dispatcher.dispatch("link", {type, name});
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

        
        const result: React.ReactNode[] =[];
        
        while(text.length > 0) {
            let selectedIndex = -1;
            const regexResult = [
                namedSectionLinkRegex.exec(text),
                unnamedSectionLinkRegex.exec(text),
                namedPassageLinkRegex.exec(text),
                unnamedPassageLinkRegex.exec(text)
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
                let linkType = selectedIndex < 2 ? "section" : "passage";
                let linkName = regexResult[2] ? regexResult[2] : regexResult[1];

                result.push(<span>{text.substring(0, regexResult.index)}</span>);
                result.push(<LinkText onClick={() => { this.onClick(linkType, linkName); }}>{regexResult[1]}</LinkText>);
                text = text.substring(regexResult.index + regexResult[0].length);

            } else {
                // 나머지를 span 에 넣는다
                result.push(<span>{text}</span>);
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

import React from "react";
import { on, off} from "./dispatch";
import Paragraph from "./paragraph";

type Props = {
    story: Story,
}

type State = {
    paragraphName: string,
}

export class StoryView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            paragraphName: props.story.getFirstParagraph(),
        }

        this.onChangeParagraph = this.onChangeParagraph.bind(this);
    }

    onChangeParagraph(value: string) {
        this.setState({ paragraphName: value });
    }

    componentDidMount() {
        on("paragraph", this.onChangeParagraph);
    }

    componentWillUnmount() {
        off("paragraph", this.onChangeParagraph);
    }

    render() {
        const { paragraphName } = this.state;
        const { story } = this.props;
        const paragraph = story.getParagraph(paragraphName);
        return paragraph.render();
    }
}

export default class Story {
    private title: string = "";
    private start: string = "";
    private paragraphes: { [name: string]: Paragraph } = {};

    addParagraph(name: string) {
        const paragraph = new Paragraph(name);
        this.paragraphes[name] = paragraph;
        return paragraph;
    }

    getFirstParagraph(): string {
        return Object.keys(this.paragraphes)[0] || "";
    }

    getParagraph(name: string) {
        return this.paragraphes[name];
    }

    render() {
        return <StoryView key={"story"} story={this} />;
    }
}
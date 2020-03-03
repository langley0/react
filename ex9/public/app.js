
class Frame extends React.Component {

    setContentRef(el) {
        this.contentRef = (el && el.contentWindow && el.contentWindow.document.body) || null;
    }

    componentDidMount() {
        ReactDOM.render(<div>THIS IS RUNTIME TAG</div>, this.contentRef)
    }

    render() {
        return <iframe 
        ref={this.setContentRef.bind(this)}
        />;
    }
}

ReactDOM.render(
    (
    <Frame/>
    ),
    document.getElementById("root")
);
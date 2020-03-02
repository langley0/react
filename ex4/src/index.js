import React from "react";
import ReactDOM from "react-dom";
import moment from 'moment';

import CircularProgressBar from "./circular-progressbar";
import { Fab, AppBar, Toolbar, Typography, IconButton } from "@material-ui/core"
import { PlayArrow, Pause, FreeBreakfast, Refresh, Menu } from "@material-ui/icons";


const pageStyle = {
    display: "flex",
    width: "100%",
    height: "90%",
    alignItems: "center"
}

const clockStyle = {
    width:"100%",
    textAlign: "center",
    padding: "20px",
}

const circularStyle = {
    width: "100%",
    textAlign: "center",
}

const floatingStyle = {
    height: "56px",
    width: "100%",
    position: "absolute",
    bottom: "20px",
    left: "0",
    textAlign: "center",
}

const floatingItemStyle = {
    margin: "10px"
}

const fabStyle = {
    background: "#fff",
    color: "#00bcd4",
};

class Page extends React.Component {
    constructor(props) {
        super(props);

        this.tick = this.tick.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handleReset = this.handleReset.bind(this);

        this.state = { 
            isPlaying: false,
            isBreak: false,
            time: this.getMaxTime(),
            maxtime: this.getMaxTime(),
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isPlaying) {
            if (!this.timer) {
                this.timer = setInterval(this.tick, 1000);
            }
        } else {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    getMaxTime(isBreak) {
        if (isBreak) {
            return 5 * 60 * 1000;
        } else {
            return 1 * 60 * 1000;
        }
    }

    tick() {
        this.setState((state) => ({
            prevtime: state.time,
            time: state.time - 1000
        }));
    }

    getPlayIcon() {
        if (this.state.isPlaying) {
            return <Pause fontSize="large"/>
        } else {
            return <PlayArrow fontSize="large"/>
        }
    }

    getBreakIcon() {
        if (this.state.isBreak) {
            return 'fa fa-briefcase';
        } else {
            return <FreeBreakfast fontSize="large"/>
        }
    }

    handleStart() {
        this.setState({
            isPlaying: !this.state.isPlaying
        });
    }

    handleReset() {
        this.setState({
            time: this.state.maxtime,
            isPlaying: false
        });
    }
    
    render() {
        return (
            <div style={pageStyle}>
                <Clock time={this.state.time} maxtime={this.state.maxtime} />
                <div style={floatingStyle}>
                    <span style={floatingItemStyle}>
                        <Fab onClick={this.handleStart} style={fabStyle}>{this.getPlayIcon()}</Fab>
                    </span>
                    <span style={floatingItemStyle}>
                        <Fab onClick={this.handleReset} style={fabStyle}><Refresh fontSize="large"/></Fab>
                    </span>
                    <span style={floatingItemStyle}>
                        <Fab style={fabStyle}>{this.getBreakIcon()}</Fab>
                    </span>
                </div>
            </div>
        );
    }
}

class Clock extends React.Component {
    render() {
        const precent = this.props.time  / this.props.maxtime;
        const timeText = moment.utc(this.props.time).format("mm분 ss초");
        return (
            <div style={clockStyle}>
                <div style={circularStyle} >
                   <CircularProgressBar value={precent} text={timeText} />
                </div>
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <AppBar position="static" color="transparent" style={{boxShadow: "none"}} >
                <Toolbar style={{color:"#ffffff"}}>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu />
                    </IconButton>
                    <Typography variant="h6" color="inherit">데모 타이머</Typography>
                </Toolbar>
            </AppBar>
        );
    }
}

ReactDOM.render(
    (
        <div style={{display:"flex", height:"100vh", justifyContent:"center", alignItems:"center"}}>
        <div style={{width:"372px", height:"667px", background: "#00bcd4"}}>
             <Header />
            <div style={{display: "flex", position:"relative", width:"100%", height:"100%", marginTop:"-64px" }}>
                <Page />
            </div>
        </div>
        </div>
    ),
    document.getElementById("root")
);
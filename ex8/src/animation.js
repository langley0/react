import React from "react";

const skills = require("./json/skills.json");
console.log(skills);

const AssetPath = "./assets/";
const ShadowPath = "./assets/shadow.png";
const AnimList = [
    "_idle_sw.json",
    "_idle_nw.json",
    "_walk_sw.json",
    "_walk_nw.json",
    "_atk_sw.json",
    "_atk_nw.json",
    "_crouch_sw.json",
    "_crouch_nw.json",
];

const styles = {
    tooltip: {
        display: "flex",
        flexDirection:"column",
        borderRadius: 12,
        border: "3px solid rgb(64,86,134)",
        backgroundColor: "rgb(24,35,56)",
        boxShadow: "0 3px 16px rgba(black, 0.15)",
        color: "#eadcdc",
        padding: "20px 20px 0 20px",
        fontFamily: "Consolas, monospace",
        zIndex:999, 
        fontSize:12,
        pointerEvents:"none",
        marginTop: 20,
        position: "absolute",
        transition: "all 0.3s ease-in-out"
    },
}

const polarToX = (angle, distance) => Math.cos(angle - Math.PI / 2) * distance;
const polarToY = (angle, distance) => Math.sin(angle - Math.PI / 2) * distance;

class RadarChar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            size: 160,
            numberOfScales: 5,
        }
    }

    pathDefinition(points) {
        let d = "M" + points[0][0].toFixed(4) + "," + points[0][1].toFixed(4);
        for(let i = 1; i < points.length; i++) {
            d += "L" + points[i][0].toFixed(4) + "," + points[i][1].toFixed(4);
        }
        return d + "z";
    }

    shape(data) {
        const { size } = this.state;
        return (
            <path 
            d={this.pathDefinition(data.map(col => { 
                return [
                    polarToX(col.angle, (col.value) * size / 2),
                    polarToY(col.angle, (col.value) * size / 2),
                ]
            }))}
            stroke={`#edc951`}
            fill={`#edc951`}
            fillOpacity=".5"
            />
        );
    }

    axis(col, i) {
        const { size, numberOfScales } = this.state;
        const points = points => points.map(point => point[0].toFixed(4) + ',' + point[1].toFixed(4)).join(' ');
        const len = size / 2 * (numberOfScales - 1) / numberOfScales;

        return <polyline 
        key={"polyaxis-"+i}
        points={points([[0, 0], [polarToX(col.angle, len), polarToY(col.angle, len)]])}
        stroke="#fff"
        strokeWidth="1"
         />
    }

    caption(col) {
        const { size } = this.state;
        return <text
            key={`caption-of-${col.key}`}
            x={polarToX(col.angle, (size / 2) * 0.95).toFixed(4)}
            y={polarToY(col.angle, (size / 2) * 0.95).toFixed(4)}
            dy={10 / 2}
            fill="#fff"
            style={{textAnchor:"middle"}}
        >
            {col.key}
        </text>;
    }

    render() {
        const { size, numberOfScales } = this.state;
        const { data } = this.props;
        const viewSize = size + 30;
        const middleOfChart = (viewSize / 2).toFixed(4);
        const datamax = (numberOfScales-1)/ numberOfScales;

        const groups = [];
        const scales = [];
        for(let i = 0; i < numberOfScales; ++i) {
            scales.push(<circle
                key={"scale-"+i}
                cx={0}
                cy={0}
                r={((i / numberOfScales) * size) / 2}
                fill="none"
                stroke="#999"
                strokeWidth={0.5}
            />)
        }

        
        groups.push(<g key={"scales"}>{scales}</g>);

        const columns = Object.keys(data).map((key, i, all) => {
            return {
                key: key,
                value: Math.min(datamax, data[key]), 
                angle: (Math.PI * 2 * i) / all.length
            };
        });

        groups.push(<g key={"axes"}>{columns.map((col, i) => this.axis(col, i))}</g>);
        groups.push(<g key={"groups"}>{this.shape(columns)}</g>);
        groups.push(<g key={"captions"}>{columns.map(col => this.caption(col))}</g>);
        

        return (
            <svg 
            width={viewSize} 
            height={viewSize}
            viewBox={`0 0 ${viewSize} ${viewSize}`}>
                <g transform={`translate(${middleOfChart}, ${middleOfChart})`}>{groups}</g>
            </svg>
        );
    }


}


class Tooltip extends React.Component {
    render() {
        const { json } = this.props;

        // 캐릭터 데이터를 정리한다
        const data = {
            "체력": json.base.health/300,
            "힘": json.base.strength/10,
            "지력": json.base.intellect/10,
            "민첩": json.base.agility/10,
            "지구력": json.base.stamina/10,
        };


        return (
            <div style={styles.tooltip}>
                <span><div style={{float:"left", color:"#aaa"}}>이름</div><div style={{ marginLeft: "50%", color:"#fff"}}>{json.displayname}</div></span>
                <span><div style={{float:"left", color:"#aaa"}}>클래스</div><div style={{ marginLeft: "50%", color:"#fff"}}>{json.class}</div></span>
                <span style={{marginTop:5}}><div style={{float:"left", color:"#aaa"}}>스킬</div>
                <div style={{marginLeft: "50%", color:"#fff"}}>{
                    Object.keys(json.skills).map((key, i) => {
                        const skillname = json.skills[key];
                    return (<div style={{ color: i >=2 ? "#fd8": null}} key={`skill-`+i}>{skills[skillname] ? (i>=2?"★" : "") + skills[skillname].name : ""}</div>)
                    })
                }</div></span>
                <RadarChar data={data}/>
            </div>
        );
    }
}

class Sprite extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loaded: false,
            hovered: false,
            data: {},
            images: {},
            shadow: null,
            currentAnim: null,
            currentFrame: null,
        };

        this.canvas = null;
        this.name = null;
    }

    async load(name) {
        const folder = AssetPath + name;
        this.name = name;

        // json 파일을로딩한다
        const promises = [];
        AnimList.forEach(v => {
            try {
                const promise = require(`${folder}/${name}${v}`);
                promises.push(promise);
            } catch(_) {
                // do nothing
            }
        });

        const jsonData = await Promise.all(promises);
        const data = {};
        AnimList.forEach((v, index) => {
            const json = jsonData[index];
            if (json) {
                data[`${name}${v}`] = json;
            }
        });

        const shadowSrc = await require(""+ ShadowPath);
        const shadow = new Image();
        shadow.src = shadowSrc;

        // 목록중 첫번째 anim 을 고른다
        const currentAnim = Object.keys(data)[0];
        
        this.setState({
            loaded: true, 
            data: data,
            shadow: shadow,
            currentAnim: currentAnim,
            currentFrame: 0,
            cursor: { x: 0, y: 0 },
        });
    }

    componentDidMount() {
        this.load(this.props.name).then(() => {
            this.draw();
        });
    }

    componentWillUnmount() {
        this.stop();
    }

    getMaxFrame(anim) {
        return Object.keys(anim.frames).length;
    }

    getFrame(anim, index) {
        const key = Object.keys(anim.frames)[index];
        const frameData = anim.frames[key];
        return frameData;
    }

    play() {
        const frameSpeed = 100;
        this.timer = setInterval(this.draw.bind(this), frameSpeed);
    }

    stop() {
        clearInterval(this.timer);
    }

    draw() {
        let { data, images, shadow, currentAnim, currentFrame } = this.state; 
        if (data && data[currentAnim]) {
            const anim = data[currentAnim];
            
            // 프레임을 하나씩 늘린다
            ++currentFrame;
            if (currentFrame >= this.getMaxFrame(anim)) {
                currentFrame = 0;
            }

            let image = images[anim.meta.image];
            if (!image) {
                image = images[anim.meta.image] = new Image(anim.meta.size.w, anim.meta.size.h);
                image.src = require(`${AssetPath + this.name}/${anim.meta.image}`);
                image.onload = () => {
                    this.draw();
                };
            }

            if (this.canvas) {
                const ctx = this.canvas.getContext("2d");
                ctx.fillStyle = "rgba(0, 0, 0, 0)"
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                const data = this.getFrame(anim, currentFrame);
                
                ctx.drawImage(shadow, 0, (data.frame.h - shadow.height) , shadow.width , shadow.height);
                ctx.drawImage(image, data.frame.x, data.frame.y, data.frame.w, data.frame.h, 0, 0, data.frame.w, data.frame.h);
            }

            this.setState({ 
                currentFrame,
                images });
        }
    }

    onMouseOver() {
        this.setState({ 
            hovered: true,
            currentAnim: Object.keys(this.state.data)[2],
            currentFrame: 0
         }, () => {
            this.play();
         });
    }

    _onMouseMove(e) {
        this.setState({ cursor : { x: e.screenX, y: e.screenY }});
      }

    onMouseOut() {
        this.setState({
            hovered: false,
            currentAnim: Object.keys(this.state.data)[0],
            currentFrame: 0,
        }, () => {
            this.stop();
            this.draw();
        })
    }

    onClick() {
        const { data, currentAnim } = this.state;
        const animList = Object.keys(data);
        let found = animList.indexOf(currentAnim);
        if (found + 1 < animList.length) {
            ++found;
        } else {
            found = 0;
        }
        const nextAnim = animList[found];
        this.setState({
            currentAnim: nextAnim,
            currentFrame: 0,
        });
    }

    render() {
        const { hovered } = this.state;
        return (
            <div style={{display: "flex", width:68, margin:10, flexDirection:"column", alignItems:"left"}}>
                <canvas 
                ref={ref => { this.canvas = ref; }} 
                width={32} 
                height={48} 
                onMouseOver={this.onMouseOver.bind(this)}
                onMouseOut={this.onMouseOut.bind(this)}
                onClick={this.onClick.bind(this)}
                style={{
                    imageRendering="pixelated",
                    width: 64,
                    height: 96,
                    borderRadius: 8,
                    backgroundColor: hovered ? "rgb(24,35,56)" : null,
                    transition: "all 0.3s ease-in-out"
                }} />
                {
                    <div style={{ 
                        opacity: hovered? 1: 0, 
                        transition: "all 0.3s ease"}}> 
                        <Tooltip json={this.props.charData} /> 
                    </div>
                }
            </div>
        );
    }
}

export default class Animation extends React.Component {

    constructor(props) {
        super(props);

        const c = require("./json/characters.json");
        this.state = {
            characters: c,
        };
    }

    render() {
        const { characters } = this.state;
        return(
            <div style= {{
                display: "flex",
                backgroundColor: "rgb(32,43,67)",
                width: "100%",
                height: "100vh",
                margin: 0,
                padding: 0,
                alignItems: "center",
                color: "#ddd",
                flexDirection: "column",
            }}>
                <h1 style={{display:"flex"}}>엔카루스 캐릭터 도감</h1>
            <div style={{
                display:"flex", 
                flexWrap:"wrap", 
                maxWidth: 640,
                maxHeight: 400,
                margin: 40}}>
                {
                    Object.keys(characters).map((cid, index) => {
                        const c = characters[cid];
                        return <Sprite key={index} name={c.name} charData={c}/>
                    })
                }
            </div>
            </div>
        );
    }

}
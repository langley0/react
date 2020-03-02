import React from 'react';

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
const VIEWBOX_HEIGHT_HALF = 50;
const VIEWBOX_CENTER_X = 50;
const VIEWBOX_CENTER_Y = 50;

function getPathDescription(radius) {
    const rotation = 0; // clockwise
    return `
    M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
    m 0,-${radius}
    a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
    a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `;
}

class Path extends React.Component {
    render() {
        const strokeWidth = this.props.strokeWidth;
        const radius = VIEWBOX_HEIGHT_HALF - strokeWidth /2;
        const diameter = Math.PI * 2 * radius;
        const gapLength = (1 - this.props.ratio) * diameter;
  
        
        return (
            <path 
            d={getPathDescription(radius)} 
            stroke={this.props.stroke || "#3e98c7"} 
            strokeWidth={strokeWidth} 
            fillOpacity={0}
            strokeDasharray={`${diameter}px ${diameter}px`}
            strokeDashoffset={`${gapLength}px`}

            style={{transition: "stroke-dashoffset 0.5s ease 0s"}}
            />
        );
    }
}

export default class CircularProgressBar extends React.Component {
    render() {
        const value = this.props.value;
        const text = this.props.text;
        return (
            <svg 
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                strokeLinecap="round" >
                    <Path ratio={value} strokeWidth={5} stroke="#fff"/>
                    { text ? <text
                        fill="#ffffff"
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        x={VIEWBOX_CENTER_X} y={VIEWBOX_CENTER_Y}>{text}</text> : null
                    }
            </svg>
        );
    }
}
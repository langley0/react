import React from 'react';

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(112,146,190)",
    },

    tableHead: {
        display: "flex",
        justifyContent: "center",
        padding: 10,
        background: "#bdbdbd",

        borderLeft: "3px solid #fefefe",
        borderTop: "3px solid #fefefe",
        borderBottom: 0,
        borderRight: "3px solid #7b7b7b",
    },

    table: {
        display: "flex",
        justifyContent: "center",
        padding: 10,
        background: "#bdbdbd",

        borderLeft: "3px solid #fefefe",
        borderTop: "0",
        borderBottom: "3px solid #7b7b7b",
        borderRight: "3px solid #7b7b7b",
    },

    tbody: {
        borderLeft: "3px solid #7b7b7b",
        borderTop: "3px solid #7b7b7b",
        borderBottom: "3px solid #fefefe",
        borderRight: "3px solid #fefefe",
    },

    tr: {
        display: "flex",
    },

    td: {
        display: "flex",
        width: 24,
        height: 24,
        borderLeft: "3px solid #fefefe",
        borderTop: "3px solid #fefefe",
        borderBottom: "3px solid #7b7b7b",
        borderRight: "3px solid #7b7b7b",
        
        fontFamily: "mine-number",
        fontWeight: "bold",
        fontSize: 28,

        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
    },

    tdPushed: {
        width: 28,
        height: 28,
        borderLeft: "2px solid #7b7b7b",
        borderTop: "2px solid #7b7b7b",
        borderBottom: 0,
        borderRight: 0,
    },

    tdEmoji: {
        fontSize: 18,
    },

    flagColor: [
        {}, 
        {color: "#1212f9"},
        {color: "#007b00"},
        {color: "#ef2e2e"},
        {color: "#00007b"},
        {color: "#7b0000"},
        {color: "#007f7e"},
        {color: "#000000"},
        {color: "#000000"},
    ],
  
    numberpad: {
        display: "flex",
        fontFamily:"digital-7",
        fontWeight: 400,
        fontSize: 32,
        background: "#000",
        color: "#a44",
        borderLeft: "2px solid #7b7b7b",
        borderTop: "2px solid #7b7b7b",
        borderBottom: "2px solid #fefefe",
        borderRight: "2px solid #fefefe",

        justifyContent: "center",
        alignItems: "center",

        width: 48,
        height: 32,
        padding: 0,
        userSelect: "none",
    },

    headCenter: {
        display: "flex",
        width: 30,
        height: 30,
        padding: 0,

        fontSize: 20,

        borderLeft: "3px solid #fefefe",
        borderTop: "3px solid #fefefe",
        borderBottom: "3px solid #7b7b7b",
        borderRight: "3px solid #7b7b7b",

        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
    },

    headCenterPushed: {
        width: 32,
        height: 32,
        borderLeft: "2px solid #7b7b7b",
        borderTop: "2px solid #7b7b7b",
        borderBottom: 0,
        borderRight: 0,
    },
};


class Tile {
    constructor() {
        this.flag = false;
        this.revealed = false;
        this.bomb = false;
        this.bombsAround = 0;
    }
}

class Board  {
    constructor(width, height, numberOfBombs) {
        this.width = width;
        this.height = height;
        this.numberOfBombs = numberOfBombs;
        
        const numberOfTile = width * height;
        this.board = Array.from({ length: numberOfTile }, () => new Tile());

        // 폭탄을 할당하기 위해서 0~n-1 의 배열을 만든다
        const indicies = Array.from(Array(numberOfTile).keys());
        for(let i = 0; i < numberOfBombs; ++i) {
            const randomSelected = Math.floor(Math.random() * indicies.length);
            const target = indicies[randomSelected];
            indicies.splice(randomSelected, 1);

            // 폭탄을 설정하고 주변의 폭탄 카운트를 하나씩 올린다
            const targetX = target % width;
            const targetY = Math.floor(target / width);
            this.board[target].bomb = true;
            
            
            this.around(targetX, targetY, (tile) => {
                tile.bombsAround ++;
            });
        }
    }

    getTile(x, y) {
        if (x >=0 && x < this.width &&
            y >=0 && y < this.height) {
            return this.board[y * this.width + x];
        }
    }
    
    around(x, y, callback) {
        for(let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                const tile = this.getTile(j, i);
                if (tile) {
                    callback(tile, j, i);
                }
            }
        }
    }

    mapRow(cb) {
        const array = [];
        for(let i = 0; i < this.height; i ++) {
            array.push(cb(i));
        }
        return array;
    }

    mapColumn(cb) {
        const array = [];
        for(let i = 0; i < this.width; i ++) {
            array.push(cb(i));
        }
        return array;
    }

    getRevealedCount() {
        return this.board.filter((value) => value.revealed).length;
    }

    isWon() {
        const noneBombTiles = this.width * this.height - this.numberOfBombs;
        return this.getRevealedCount() === noneBombTiles;
    }
}


export default class Game extends React.Component {
    
    constructor(props) {
        super(props);

        const width = this.props.width;
        const height = this.props.height;
        const bombs = this.props.bombs;


        this.state = {
            board: new Board(width, height, bombs),
            isLost: false,
            isWon: false,
            time : 0,
            started: false,
            flagCount: bombs,
            emojiPushed: false,
        }

        this.timerID = null;
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.width !== this.props.width ||
            prevProps.height !== this.props.height ||
            prevProps.bombs !==  this.props.bombs) {
            this.restart();
        }
    } 

    leftClick(clickX, clickY) {
        this.setState(prevState => {
            let { isLost, isWon, started } = prevState;
            if (isLost || isWon) return;
            const { board } = prevState;

            if (!started) {
                started = true;
                this.timerID = setInterval(() => this.tick(), 1000);
            }
            
            
            const clickedTile = board.getTile(clickX, clickY);
            if (clickedTile === null) { return; }
            const targets = [];

            if (clickedTile.revealed) {
                // 자신주변에 깃발이 자신이 가지고 있는 폭탄 숫자만큼 되어 있으면 나머지를 전부 리빌한다
                let flagCount = 0;
                board.around(clickX, clickY, (a_tile) => {
                    if (a_tile.flag) {
                        ++flagCount;
                    }
                });

                if (clickedTile.bombsAround === flagCount) {
                    // 나머지를 리빌한다
                    board.around(clickX, clickY, (a_tile, a_x, a_y) => {
                        if (!a_tile.revealed && !a_tile.flag) {
                            targets.push({ x: a_x, y: a_y });
                        }
                    });
                }

            } else {
                targets.push({ x: clickX, y: clickY });
            }

            while(targets.length > 0) {
                const target = targets.shift();
                const { x, y } = target;
                const tile = board.getTile(x, y);
                if (!tile.revealed && !tile.flag) {
                    tile.revealed = true;
                    if (tile.bombsAround === 0) {

                        // 근접에 폭탄이 없으면 펼친다
                        board.around(x, y, (a_tile, a_x, a_y) => {
                            targets.push({ x: a_x, y: a_y});
                        });
                    }

                    if (tile.bomb) {
                        // 폭탄을 눌렀다
                        isLost = true;
                        clearInterval(this.timerID);
                    }
                } 
            }

            if (!isLost) {
                // 폭탄이외의 모든 블럭이 오픈되었으면 승리하였다
                isWon = board.isWon();
                if  (isWon) {
                    clearInterval(this.timerID);
                }
            }
            
            return { board, started, isWon, isLost };
        });
    }

    rightClick(x, y, e) {
        e.preventDefault();

        this.setState(prevState => {
            let { isLost, isWon, started, flagCount } = prevState;
            if (isLost || isWon) return;
            const { board } = prevState;

            if (!started) {
                started = true;
                this.timerID = setInterval(() => this.tick(), 1000);
            }

            const tile = board.getTile(x, y);
            if (!tile.revealed) {
                tile.flag = !tile.flag;
                if (tile.flag) {
                    flagCount --;
                } else {
                    flagCount ++;
                }
            }

            return { board, started, flagCount };
        });
    }

    tilePushed(x, y, e) {
        e.preventDefault();
        if (e.button === 0) {
            this.setState(prevState => {
                let { isLost, isWon } = prevState;
                if (isLost || isWon) return;
                const { board } = prevState;

                const tile = board.getTile(x, y);
                let updated = false;
                if (!tile.flag) {
                    tile.pushed = true;
                    updated = true;

                    if (tile.revealed) {
                        // 주변에 unreveal 타일을 전부 push 시킨다
                        board.around(x, y, (atile) => {
                            if (!atile.revealed && !atile.pushed) {
                                atile.pushed = true;
                                updated = true;
                            }
                        });
                    }
                } 
                
                return updated ? { board } : null;
            });
        }
    }

    tileReleased(x, y, e) {
        e.preventDefault();

        this.setState(prevState => {
            let { isLost, isWon } = prevState;
            if (isLost || isWon) return;
            const { board } = prevState;

            const tile = board.getTile(x, y);
            let updated = false;
            if (tile.pushed) {
                tile.pushed = false;
                updated = true;
                // 주변타일들도 모두 업시킨다
                if (tile.revealed) {
                    board.around(x, y, (atile) => {
                        if (atile.pushed) {
                            atile.pushed = false;
                            updated = true;
                        }
                    });
                }
            }

            return updated ? { board } : null;
        });
    }

    emojiPushed() {
        this.setState({ emojiPushed: true })
    }

    emojiReleased() {
        this.setState({ emojiPushed: false })
    }


    tick() {
        const { time } = this.state;
        this.setState({
            time: time < 999 ? time + 1 : time,
        });
    }

    padNumber(num, padLen, padChar) {
        const pad_char = typeof padchar !== 'undefined' ? padChar : '0';
        const pad = new Array(1 + padLen).join(pad_char);
        return (pad + num).slice(-pad.length);
    }

    restart() {
        clearInterval(this.timerID);

        const width = this.props.width;
        const height = this.props.height;
        const bombs = this.props.bombs;

        const state = {
            board: new Board(width, height, bombs),
            isLost: false,
            isWon: false,
            time : 0,
            started: false,
            flagCount: bombs,
            emojiPushed: false,
        }

        this.setState(state);
    }

    render() {
        const { board, time, flagCount, isWon, isLost, emojiPushed } = this.state;
        const headCenterStyle = { ...styles.headCenter };
        if (emojiPushed) {
            Object.assign(headCenterStyle, styles.headCenterPushed);
        }

        return (
            <div style={styles.root}>
                <table style={styles.tableHead}>
                    <tbody style={styles.tbody}>
                        <tr style={styles.tr}>
                        {board.mapColumn(x => {
                            return (<td key={x} style={{display:"flex", width: 30, height: 0 }}></td>)
                        })}
                        </tr>
                        <tr style={{display: "flex", flexDirection: "row", justifyContent: "space-between", padding: 4 }}>
                            <td style={styles.numberpad}>
                                { this.padNumber(flagCount, 3, "0") }
                            </td>
                            <td 
                            style={headCenterStyle} 
                            onClick={this.restart.bind(this)}
                            onMouseDown={this.emojiPushed.bind(this)}
                            onMouseUp={this.emojiReleased.bind(this)}
                            onMouseLeave={this.emojiReleased.bind(this)}
                            >
                                { isWon ? '😎' : isLost ? '😫' : emojiPushed ? '🙄' : '☺️' }
                            </td>
                            <td style={styles.numberpad}>
                                { this.padNumber(time, 3, "0") }
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table style={styles.table}>
                    <tbody style={styles.tbody}>
                        {board.mapRow((y) => {
                            return <tr key={y} style={styles.tr}>
                                {board.mapColumn(x => {
                                    const tile = board.getTile(x, y);
                                    const tdStyle = { ...styles.td };
                                    let display = null;
                                    if (tile.revealed) {
                                        Object.assign(tdStyle, styles.tdPushed);

                                        // 폭탄여부에 따라서 표현을 다르게 해준다
                                        if (tile.bomb) {
                                            display = '💣';
                                            Object.assign(tdStyle, styles.tdEmoji);
                                        } else {
                                            display = tile.bombsAround > 0 ? tile.bombsAround.toString() : null;
                                            Object.assign(tdStyle, styles.flagColor[tile.bombsAround]);
                                        }
                                    } else if (tile.flag) {
                                        display = '🚩';
                                        Object.assign(tdStyle, styles.tdEmoji);
                                    } else if (tile.pushed) {
                                        Object.assign(tdStyle, styles.tdPushed);
                                    }
                                   
                                    return (
                                        <td 
                                        disabled={true}
                                        onMouseDown={this.tilePushed.bind(this, x, y)}
                                        onMouseLeave={this.tileReleased.bind(this, x, y)}
                                        onMouseUp={this.tileReleased.bind(this, x, y)}
                                        onClick={this.leftClick.bind(this, x, y)}
                                        onContextMenu={this.rightClick.bind(this, x, y)}
                                        key={x} 
                                        style={tdStyle}>
                                            { display }
                                        </td>
                                    )
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
                

            </div>
        )
    }

}
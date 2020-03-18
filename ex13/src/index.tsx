import React from "react";
import ReactDOM from "react-dom";

import { compile } from "./story/compiler"

const story = compile(
`[intro]:
@title 어두운 방안

눈을 떠보니 아무 무늬 없는 벽과 바닥이 보인다. 
이런 이상한 곳에서 눈을 뜬 이유 따위는 생각나지 않는다. 

정신을 차려보니 작은 [문]:(@set #1=저 문은 여기서 나가는 유일한 방법인 것 같다, @select [문을 열고 나간다]:(room1))이 하나 보인다. 

{#1}

[room1]:
@title 붉은 방

문을 통과하니 붉은 방이 나왔다

`
);

//console.log(story);

if (story) {
    const main = (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", userSelect:"none"}}>
    <div style={{margin: 20, width: "700px"}}>
        {story.render()}
    </div></div>);
    ReactDOM.render(main, document.getElementById("root"));   
}
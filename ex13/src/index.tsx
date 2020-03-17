import "react";
import ReactDOM from "react-dom";
/*import Notifications from "./ui/notifications";

import { compile } from "./compiler"
import Player from "./player";*/

import { parser } from "./parser";


/*const story = compile(
`I walked to the shops and I bought {label:1=a pint of milk}. {label:2=a pint of milk}.

Or maybe [I bought something different?](@replace 1=a loaf of bread)`);

if (story) {
    const player = new Player(story);
    player.begin();


    ReactDOM.render(<Notifications dispatcher={player.dispatcher} data={player.data}/>, document.getElementById("root"));
}*/

const story = parser(
`[시작]:
여기는 패러그래프 안입니다 [하이퍼링크]가 제대로 보이는지 확인
다음 문장이 어떻게 보이는지 확인이 필요
줄바꿈이 제대로 보이는가

[하이퍼링크]:
링크를 클릭하였습니다
{@label:1=첫번째링크입니다}
{@label:1}
[이링크를 클릭하면 이동합니다]:(test-chapter)

[test-chapter]:
{@label:2=아래의 버튼을 클릭하면 바뀝니다}
[버튼]:(@replace 2=다른글)
`
);

if (story) {
    ReactDOM.render(story.render(), document.getElementById("root"));   
}
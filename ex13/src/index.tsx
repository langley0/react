import React from "react";
import ReactDOM from "react-dom";

import { compile  } from  "./compile";
import { Story } from "./component";
import VM from "./vm";

const story = compile(`
[[intro]]
당신은 힘겹게 눈을 떴다. 
당신의 눈에는 회색의 거칠한 돌 - *천장* - 이 보인다. 

머리가 매우 아파온다.
당신은 바닥에 쓰러져, 거칠고 회색 빛의 천장을 바라 보고 있다. 
이 곳이 어디인지는 생각나지 않는다.


당신은 천천히 바닥에 몸을 굴려서(바닥은 표면이 매끄럽다), 상체를 일으켜본다. 몸에 통증이 심하다. 
당신은 아래에서 위로 시선을 올려본다. 
벽과 천장은 너무 거칠어서 손으로 만지면 다칠 수 있다.


번개에 맞아 몸을 갈갈이 찢어놓는듯한 통증이 기억났다. 하지만 그것뿐이었다.


과거에 무슨 일이 있었는지 생각나지 않는다. 아무거나라도 생각해 내려고 했지만 할 수 없었다. 당신은 완전히 *기억을 잃었다* 

[계속](cell)

[[cell]]
**작은방**
-----------------
이 공간은 , 두 팔을 벌렸을때와 비슷한 크기이고, 돌들을 적당히 네모나게 잘라서, 마감도 하지 않은채 적당히 만든 곳같다.
바닥만이 매끈하게 마감처리되어 있다. 왼쪽으로 좁은 틈이 보인다.

* [머리를 숙여 좁은 틈으로 들어간다](narrow_hallway)

[[narrow_hallway]]
**좁은 복도**
--------------------------
당신은 창문이 없는 좁은 복도에 서있다. 
앞에는 눈에 보이지 않을 정도로 높은 곳으로 연결된 계단이 있다. 
뒤쪽으로는 당신이 지나온 작은 출입구가 있다.

*[계단을 올라간다](stairs)
*[뒤로 돌아간다](cell)

[[stairs]]
당신은 계단을 올라간다. 한참을 지난 것 같은 느낌이 든다. 
창문도 없어서 흐릿하게 보이는 돌을 밟고...  계속... 계속 ... [올라가고 있다](doorway).

[doorway]
드디어 계단 끝에 부드러운 촛불빛이 보인다

[빛이 보이는 쪽으로 간다](chamber)

[[chamber]]
**정돈되지 않은 서재**
--------------------
당신은 잡동사니들과 선반, 각종 물품더미에 둘러쌓여 있다. 
이 방은 충분히 넓고, 낡은 나무 책상이 가운데에 놓여져 있다. 
그러나 책상은 주변으로 물건들이 벽처럼 쌓여있어서 서있을 공간조차 찾기 힘들어 보인다.

[주변을 살펴본다](lookaround)

[lookaround]

책, 서류뭉치, 말린 식물, 동물박제, 다양한 색의 양조. 절반은 무엇인지 조차 파악핤구 없고, 나머지 절반도 정확한 이름을 알지는 못한다.


방의 [정면](chamber-f)과 [오른쪽](chamber-r)에는 큰 통로가 보인다. [왼쪽](chamber-l)으로는 무거워 보이는 나무문이 있다. 뒤쪽으로는 어두운 공간으로 연결된 계단이 있다.

책상위에 있는 거대한 책이 보인다. 책상뒤쪽으로 유리문이 달린 커다란 찬장이 있다.  그 옆으로 구리로 된 사물함이 있는데 닫혀있다.

이곳의 사분의일 아니 십분의 일만큼의 책이어도, 어느 연구자의 방이라고 생각될 정도이다. 심지어 이정도의 책이라니! 이곳의 주인이 일생동안 연구만 하고 있다는 것을 보여주고 있다. 

당신은 어디에 있는지는 모른다. 하지만 이곳이 무엇을 하는 곳인지는 알고 있다. 당신은 바로 *마법사의 탑* 안에 있다.

[chamber-f]
-----------------
정면의 문은 지금 갈 수 없다

[chamber-r]
-----------------
오른쪽의 문은 지금 갈 수 없다

[chamber-l]
-----------------
왼쪽의 문은 지금 갈 수 없다

 `); 

const vm = new VM();
 
const main = (<div style={{display:"flex", flexDirection:"column", alignItems:"center", userSelect:"none"}}>
<div style={{margin: 20, width: "700px"}}>
    <Story src={story} vm={vm}/>
</div></div>);
ReactDOM.render(main, document.getElementById("root"));   
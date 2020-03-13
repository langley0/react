export default [{
    id: 1,
    condition: null,
    repeatable: false,
    commands: [ 
        ["journal", "눈을 떠보니 바다와 모래가 보인다\n처음보는 풍경이다"],
        ["journal", "가까스로 폭풍을 만나 타고 가던 배가 침몰하던 것이 생각났다"],
        ["journal", "구조대를 기다리는 동안 살아남아야 한다"],
        ["addstage", "beach"],
    ]
},
{
    id: 2,
    condition: (game) => { 
        const stage = game.stages.get("beach") ;
        return (stage && stage.visited >= 1);
    },
    repeatable: false,
    commands: [ 
        ["journal", "비교적 안전한 장소를 발견하였다\n불을 피워 몸을 말려야겠다"],
        ["addbuilding", "campfire"],    
    ]
},
{
    id: 3,
    condition: (game) => { 
        const camp = game.buildings.get("campfire") ;
        return (camp && camp.isBuilt());
    },
    repeatable: false,
    commands: [ 
        ["journal", `덤불속에서 이상한 소리가 나면서 사람이 나타났다`],
        ["journal", `그는 나와 같이 배를 탔던 사람이고, 불빛을 보고 왔다고 한다`],
        ["journal", `둘이라면 혼자보다 살아남을 확률이 더 높을  것이다. 나는 함께하자고 제안했고 그도 흔쾌히 받아들였다`],
        ["addsurvivor", 1],    
    ]
},
{
    id: 4,
    condition: (game) => { 
        const stage = game.stages.get("beach") ;
        return (stage && stage.visited >= 2);
    },
    repeatable: false,
    commands: [ 
        ["journal", "모래사장 끝 바위너머에서 다른 곳으로 가는 길을 찾았다"],
        ["addstage", "coast"],    
    ]
},
];
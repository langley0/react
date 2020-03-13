export default [
    {
        id: "beach",
        name: "모래사장",
        exploreRequired: 1,
        exploreDuration: 2, // sec
        // 탐험을 통해서 발견할 수 있는 자원
        resources: [{
            id: "wood",
            min: 1,
            max: 1,
        }]
    },
    {
        id: "coast",
        name: "해안가",
        exploreRequired: 2,
        exploreDuration: 10, // sec
        // 탐험을 통해서 발견할 수 있는 자원
        resources: [{
            id: "wood",
            min: 2,
            max: 3,
        },{
            id: "strap",
            min: 0,
            max: 2,
        }]
    },
];
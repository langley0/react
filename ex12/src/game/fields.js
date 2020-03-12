const fields = [
    {
        id: 1,
        name: "시작의 해변",
        exploreRequired: 1,
        exploreDuration: 2, // sec
        collections: [{
            rate: 1,
            id: "crab"
        }, {
            rate: 1,
            id: "woodstick",
        }]
    },

    {
        id: 2,
        name: "해변",
        exploreRequired: 1,
        exploreDuration: 10, // sec
        collections: [],
    },
];

export default fields;
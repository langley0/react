import Game from "./index";

const game = new Game();
game.load();
game.start();

setInterval(() => {
    // test script
    game.build("campfire");
    if (game.getStages().length > 0) {
        game.explore("beach");
    }
}, 1000);

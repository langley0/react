import React from "react";
import ReactDOM from "react-dom";
import Notifications from "./ui/notifications";

import { compile } from "./compiler"
import Player from "./player";


const story = compile(
`Clicking this [link] [link2] will show an alert.

[link]:
    console.log("Hello!");
    
Text for the passage.`);

if (story) {
    const player = new Player(story);
    player.begin();


    ReactDOM.render(<Notifications dispatcher={player.dispatcher}/>, document.getElementById("root"));
}
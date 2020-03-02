import React from "react";
import ReactDOM from "react-dom";

import TexEditor from './tex-editor'
import TweetEditor from './tweet-editor'

ReactDOM.render(
    (
        <div>
            <TweetEditor />
            <TexEditor />
        </div>
    ),
    document.getElementById("root")
);
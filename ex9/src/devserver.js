const express = require("express");

const app = express();
app.use(express.static("public"));
app.listen(3000, () => {
    console.log("React Ex9 Devserver running on port 3000")
});
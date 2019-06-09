const path = require("path");
const express = require("express");
const es6Middleware = require("./es6-middleware.js");

const app = express();

app.use(new RegExp("/www/.*.ejs$"), es6Middleware);
app.use("/www", express.static("www"));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});


const listener = app.listen(7021, function() {
    console.log(`listening on ${listener.address().port}`);
});


// End

const path = require("path");
const express = require("express");

const app = express();

app.use("/www", express.static("www"));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});


const listener = app.listen(7021, function() {
    console.log(`listening on ${listener.address().port}`);
});


// End

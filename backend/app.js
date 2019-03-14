const express = require("express");
const app = express();
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

app.use(express.static('dist'));

// app.get("/", (req, res) => res.send("Hello World"));

app.get("/", (request, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});



app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
});

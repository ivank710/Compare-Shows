const express = require("express");
const app = express();
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

app.use(express.static('dist'));

// app.get("/", (request, res) => {
//   res.sendFile(path.join(__dirname, "./dist/index.html"));
// });

// const formatTitle = (title) => {
//   if(title.split(" ").length === 1) {
//     return title.toLowerCase();
//   } else {
//     let result;
//     result = title.toLowerCase().split(" ").join("-");
//     return result;
//   }
// };

// // route to get a single show with its main info
// app.get('/shows/:title', (request, response) => {
//   const title = formatTitle(request.params.title);

//   fetch(`http://api.tvmaze.com/singlesearch/shows/?q=${title}`)
//   .then((response) => {
//     return response.text();
//   }).then((body) => {
//     let results = JSON.parse(body);
//     console.log(results.id); //logs to server
//     response.send(results); //sends to FE
//   });
// });



app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
});

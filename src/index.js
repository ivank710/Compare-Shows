const axios = require('axios');

console.log('working');

document.addEventListener('DOMContentLoaded', () => {
  
  const getShow = () => {
    const userInput = document.getElementById("showTitle").value;

    axios
    .get(`http://api.tvmaze.com/singlesearch/shows/?q=${userInput}`)
    .then(response => {
      let showId = response.data.id;
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  };
  
  const showButton = document.getElementById("findShow");
  showButton.addEventListener("click", getShow);
  
  
});



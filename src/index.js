const axios = require('axios');

console.log('working');

document.addEventListener('DOMContentLoaded', () => {
  
  const getShow = () => {
    const userInput = document.getElementById("showTitle").value;
    
    axios
    .get(`http://api.tvmaze.com/singlesearch/shows/?q=${userInput}`)  //get show
    .then(response => {
      const showId = response.data.id;
      console.log(response);

      axios
      .get(`http://api.tvmaze.com/shows/${showId}/seasons`)   //get seasons
      .then(response => {
        // dataReducer(initialState, {
        //   type: 'a',
        //   data: response.data
        // })
        console.log(response.data);
          
        axios
        .get(`http://api.tvmaze.com/shows/${showId}/episodes`) //get episodes
        .then(response => {
          console.log(response.data);

          axios
            .get(`http://api.tvmaze.com/shows/${showId}/cast`) //get cast
            .then(response => {
              console.log(response.data);

          });
        });
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  };
  
  
  const showButton = document.getElementById("findShow");
  showButton.addEventListener("click", getShow);

  // showButton.addEventListener("click", getSeasons);

  // const initialState = {};
  // const dataReducer = (state = initialState, action) => {
  //   switch(action.type) {
  //     case 'a':
  //     default: 
  //       return state;
  //   }
  // }
  
});



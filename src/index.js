const axios = require('axios');
// const HTMLParser = require('node-html-parser');
// import { parse } from "node-html-parser";


console.log('working');

document.addEventListener('DOMContentLoaded', () => {
  
  const getShow = () => {
    const userInput = document.getElementById("showTitle").value;
    
    axios
    .get(`http://api.tvmaze.com/singlesearch/shows/?q=${userInput}`)  //get show
    .then(response => {
      const showId = response.data.id;
      const premiereDate = response.data.premiered;
      const genres = response.data.genres; //array of genres
      const rating = response.data.rating.average;
      const runtime = response.data.runtime;
      // const summary = HTMLParser.parse(response.data.summary);
      const summary = response.data.summary;
      let network = "";
      if (response.data.network) {
        network = response.data.network.name;
      } else if (response.data.webChannel.name){
        network = response.data.webChannel.name;
      }
      // console.log(response.data);

      axios
      .get(`http://api.tvmaze.com/shows/${showId}/seasons`)   //get seasons
      .then(response => { //array of each season
        for(let i = 0; i < response.data.length; i++) {
          let seasonId = response.data[i].id;
          
          axios
          .get(`http://api.tvmaze.com/seasons/${seasonId}/episodes`)
          .then(response => {
            const season = response.data;
            // console.log(season); //array of one season w/ its episodes as Obj

          });
        }

      axios
      .get(`http://api.tvmaze.com/shows/${showId}/cast`) //get cast
      .then(response => {
        let mainCast = response.data; //array of each character
        // console.log(mainCast);

        for(let j = 0; j < mainCast.length; j++) {
          let personId = mainCast[j].person.id;

          axios
          .get(`http://api.tvmaze.com/people/${personId}/castcredits`)
          .then(response => {
            let otherShows = response.data; //array of each char's shows
            // console.log(response.data);

            for(let k = 0; k < otherShows.length; k++) {
              let relatedShowUrl = otherShows[k]._links.show.href;  //get show url
              // console.log(otherShows[k]._links.show.href);
              axios
              .get(relatedShowUrl)
              .then(response => {
                let showObj = response.data;  //showObj.name 
                // console.log(showObj);  
              });
            }
          });
        }
      });

      axios
        .get(`http://api.tvmaze.com/shows/${showId}/crew`)
        .then(response => {
          const crewMembers = response.data; //array of each crew member(obj)
          console.log(crewMembers);
        });

      });
    })
    .catch(function (error) {
      console.log(error);
    });
  };
  
  const showButton = document.getElementById("findShow");
  showButton.addEventListener("click", getShow);


  // const initialState = {};
  // const dataReducer = (state = initialState, action) => {
  //   switch(action.type) {
  //     case 'a':
  //     default: 
  //       return state;
  //   }
  // }
  
});



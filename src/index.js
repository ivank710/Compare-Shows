const axios = require('axios');
const HTMLParser = require('node-html-parser');
import { parse } from "node-html-parser";

console.log('working');

document.addEventListener('DOMContentLoaded', () => {
  let showData = {
    info: {},
    seasons: {},
    cast: {},
    crew: {}
  };
  
  const getShow = async () => {
    const userInput = document.getElementById("showTitle").value;
    
    const response = await axios.get(`http://api.tvmaze.com/singlesearch/shows/?q=${userInput}`); 

    showData.id = response.data.id;
    showData.info.premiereDate = response.data.premiered;
    showData.info.genres = response.data.genres;
    showData.info.rating = response.data.rating.average;
    showData.info.runtime = response.data.runtime;
    showData.info.summary = response.data.summary; //need to parse html
    if (response.data.network) {
      showData.info.network = response.data.network.name;
    } else if (response.data.webChannel.name) {
      showData.info.network = response.data.webChannel.name;
    }

    const seasons = await axios.get(`http://api.tvmaze.com/shows/431/seasons`);   //get seasons
    showData.seasons = seasons.data;
   
    for(let i = 0; i < showData.seasons.length; i++) {
      let seasonId = showData.seasons[i].id;
      
      const episodes = await axios.get(`http://api.tvmaze.com/seasons/${seasonId}/episodes`);
      showData.seasons[i] = episodes.data;
    }
    
    const cast = await axios.get(`http://api.tvmaze.com/shows/${showData.id}/cast`);
    showData.cast = cast.data;
    // console.log(cast.data);

    const crew = await axios.get(`http://api.tvmaze.com/shows/${showData.id}/crew`);
    showData.crew = crew.data;
    // console.log(crew.data);
    
    for(let j = 0; j < showData.cast.length; j++) {   //assign each cast member's person obj with one's other show urls
      let member = showData.cast[j];
      let personId = member.person.id;
      
      const otherShows = await axios.get(`http://api.tvmaze.com/people/${personId}/castcredits`); //get the person's other shows
      showData.cast[j].person.showUrls = otherShows.data;
      showData.cast[j].person.shows = [];

      for (let k = 0; k < showData.cast[j].person.showUrls.length; k++) {
        let showUrl = showData.cast[j].person.showUrls[k]._links.show.href;  //get show url

        const show = await axios.get(showUrl);  //get the show
        const showName = show.data.name;
        showData.cast[j].person.shows.push(showName);
      }
    }
    
    console.log(showData)

    // const nodeDate = {
    //   "root": `title`, 
    //   "children": [{
    //     "name1": "Basic Info",
    //     "children": [{"Premiere Date": `${showData.info.premiereDate}`, "size": 1 }, {"Rating": `${showData.info.rating}`, "size": 1 }, {"Runtime": `${showData.info.runtime}`, "size": 1}, 
    //                 {"Summary": `${showData.info.summary}`, "size": 1}, {"Genres": `${showData.info.genres}`, }]
    //   }]
    // }


  };


  const showButton = document.getElementById("findShow");
  showButton.addEventListener("click", getShow);



  
});



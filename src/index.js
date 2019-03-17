const axios = require('axios');
// const HTMLParser = require('node-html-parser');
// import { parse } from "node-html-parser";
import renderSunburst from './d3';

console.log('working');

document.addEventListener('DOMContentLoaded', () => {

  let nodeData = {
    node: "",
    children: [
    {
      node: "Info",
      children: [{ "name": "Premiere Date", "value": ""}, {"name": "Rating", "value": ""}, {"name": "Runtime", "value": ""}, {"name": "Network", "value": ""},
      {"name": "Summary", "value": ""}, {"name": "Genres", "children": []}]
    },
    {
      node: "Seasons",
      children: []
    },
    {
      node: "Cast",
      children: []
    },
    {
      node: "Crew",
      children: []
    }
    ]
  };
  
  const getShow = async () => {
    const userInput = document.getElementById("showTitle").value;
    nodeData.node = userInput;
    
    const response = await axios.get(`http://api.tvmaze.com/singlesearch/shows/?q=${userInput}`); 

    let showId = response.data.id;

    for (let a = 0; a < nodeData.children.length; a++) {
      let child = nodeData.children[a];
      if (child.node === "Info") {
        for (let b = 0; b < child.children.length; b++) {
          let innerChild = child.children[b];
          if (innerChild.name === "Premiere Date") {
            innerChild.value = response.data.premiered;
            innerChild.size = 1;
          } else if (innerChild.name === "Rating") {
            innerChild.value = response.data.rating.average;
            innerChild.size = 1;
          } else if (innerChild.name === "Runtime") {
            innerChild.value = response.data.runtime;
            innerChild.size = 1;
          } else if (innerChild.name === "Network") {
            if (response.data.network) {
              innerChild.value = response.data.network.name;
            } else if (response.data.webChannel.name) {
              innerChild.value = response.data.webChannel.name;
            }
            innerChild.size = 1;
          } else if (innerChild.name === "Summary") {
            innerChild.value = response.data.summary;
            innerChild.size = 1;
          } else if (innerChild.name === "Genres") {
            for (let c = 0; c < response.data.genres.length; c++) {
              let genre = response.data.genres[c];
              let genreNode = {"name": genre, "size": 1};
              innerChild.children.push(genreNode);
            }
          }
        }
      } else if (child.node === "Seasons") {
        const seasons = await axios.get(`http://api.tvmaze.com/shows/${showId}/seasons`);   //get seasons
        // child.size = seasons.data.length;

        for (let i = 0; i < seasons.data.length; i++) {
          let seasonId = seasons.data[i].id;

          const episodes = await axios.get(`http://api.tvmaze.com/seasons/${seasonId}/episodes`);
          child.children.push(episodes.data);
        }
     
      } else if (child.node === "Cast") {
        const cast = await axios.get(`http://api.tvmaze.com/shows/${showId}/cast`);

        child.children = cast.data;
      } else if (child.node === "Crew") {
        const crew = await axios.get(`http://api.tvmaze.com/shows/${showId}/crew`);

        child.children = crew.data;
      }
    }

    for(let it = 0; it < nodeData.children.length; it++) {    //format seasons with children nodes 
      let child = nodeData.children[it];

      if(child.node === "Seasons") {
        let seasonsChildren = [];

        for(let e = 0; e < child.children.length; e++) {
          let episodes = child.children[e];
          let epChild = {"node": `Season ${e + 1}`, "children": []};

          for(let l = 0; l < episodes.length; l++) {
            let ep = episodes[l];
            let epName = ep.name;

            let epNode = {"name": epName, "size": 1};
            epChild.children.push(epNode);
          }

          seasonsChildren.push(epChild);
        }
        child.children = seasonsChildren;
        
      } else if(child.node === "Cast") {
        let castChildren = [];

        for(let f = 0; f < child.children.length; f++) {
          let char = child.children[f];
          let personId = char.person.id;
          // console.log(char)
          let charChild = { "name": char.person.name, "character": char.character.name, "children": [] };

          const otherShows = await axios.get(`http://api.tvmaze.com/people/${personId}/castcredits`);
          for(let g = 0; g < otherShows.data.length; g++) {
            let charCredit = otherShows.data[g];
            let showUrl = charCredit._links.show.href;

            const show = await axios.get(showUrl);
            const showName = show.data.name;
            let showNode = {"Show": showName, "size": 1};
            charChild.children.push(showNode);
          }
          castChildren.push(charChild);
        }
        child.children = castChildren;
      } else if(child.node === "Crew") {
          let crewChildren = [];

          for(let z = 0; z < child.children.length; z++) {
            let crewMember = child.children[z];
            let role = crewMember.type;
            let name = crewMember.person.name;

            let crewNode = {"name": name, "role": role, "size": 1};
            crewChildren.push(crewNode);
          }

        child.children = crewChildren;
      }
    }

    // return nodeData;
    // console.log(nodeData);
    renderSunburst(nodeData);
  }

   
  
  const showButton = document.getElementById("findShow");
  showButton.addEventListener("click", getShow);
  
});



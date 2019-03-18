const axios = require('axios');
import renderSunburst from './d3';

document.addEventListener('DOMContentLoaded', () => {

  let nodeData = {
    name: "",
    children: [
    {
      name: "Info",
      children: [{ "name": "Premiere", "children": []}, {"name": "Rating", "children": []}, {"name": "Runtime", "children": []}, {"name": "Network", "children": []},
      {"name": "Genres", "children": []}]
    },
    {
      name: "Seasons",
      children: []
    },
    {
      name: "Cast",
      children: []
    },
    {
      name: "Crew",
      children: []
    }
    ]
  };
  
  const getShow = async () => {
    const userInput = document.getElementById("showTitle").value;
    nodeData.name = userInput;
    
    const response = await axios.get(
      `https://api.tvmaze.com/singlesearch/shows/?q=${userInput}`
    ); 

    let showId = response.data.id;

    for (let a = 0; a < nodeData.children.length; a++) {
      let child = nodeData.children[a];
      if (child.name === "Info") {
        for (let b = 0; b < child.children.length; b++) {
          let innerChild = child.children[b];
          if (innerChild.name === "Premiere") {
            let premierNode = { "name": response.data.premiered, "size": 1};
            innerChild.children.push(premierNode);
          } else if (innerChild.name === "Rating") {
            let ratingNode = { "name": `${response.data.rating.average}`, "size": 1};
            innerChild.children.push(ratingNode);
          } else if (innerChild.name === "Runtime") {
            let runtimeNode = { "name": `${response.data.runtime}`, "size": 1};
            innerChild.children.push(runtimeNode);
          } else if (innerChild.name === "Network") {
            if (response.data.network) {
              let networkNode = { "name": response.data.network.name, "size": 1};
              innerChild.children.push(networkNode);
            } else if (response.data.webChannel.name) {
              let networkNode = { "name": response.data.webChannel.name, "size": 1 };
              innerChild.children.push(networkNode);
            }
          } else if (innerChild.name === "Genres") {
            for (let c = 0; c < response.data.genres.length; c++) {
              let genre = response.data.genres[c];
              let genreNode = {"name": genre, "size": 1};
              innerChild.children.push(genreNode);
            }
          }
        }
      } else if (child.name === "Seasons") {
        const seasons = await axios.get(`https://api.tvmaze.com/shows/${showId}/seasons`);   //get seasons
        // child.size = seasons.data.length;

        for (let i = 0; i < seasons.data.length; i++) {
          let seasonId = seasons.data[i].id;

          const episodes = await axios.get(`https://api.tvmaze.com/seasons/${seasonId}/episodes`);
          child.children.push(episodes.data);
        }
     
      } else if (child.name === "Cast") {
        const cast = await axios.get(`https://api.tvmaze.com/shows/${showId}/cast`);

        child.children = cast.data;
      } else if (child.name === "Crew") {
        const crew = await axios.get(`https://api.tvmaze.com/shows/${showId}/crew`);

        child.children = crew.data;
      }
    }

    for(let it = 0; it < nodeData.children.length; it++) {    //format seasons with children nodes 
      let child = nodeData.children[it];

      if(child.name === "Seasons") {
        let seasonsChildren = [];

        for(let e = 0; e < child.children.length; e++) {
          let episodes = child.children[e];
          let epChild = {"name": `Season ${e + 1}`, "children": []};

          for(let l = 0; l < episodes.length; l++) {
            let ep = episodes[l];
            let epName = ep.name;

            let epNode = {"value": `Episode ${l + 1}`, "name": epName, "size": 1};
            epChild.children.push(epNode);
          }

          seasonsChildren.push(epChild);
        }
        child.children = seasonsChildren;
        
      } else if(child.name === "Cast") {
        let castChildren = [];

        for(let f = 0; f < child.children.length; f++) {
          let char = child.children[f];
          let personId = char.person.id;
          // console.log(char)
          let charChild = { "name": char.person.name, "character": char.character.name, "children": [] };

          const otherShows = await axios.get(`https://api.tvmaze.com/people/${personId}/castcredits`);
          for(let g = 0; g < otherShows.data.length; g++) {
            let charCredit = otherShows.data[g];
            let showUrl = charCredit._links.show.href;

            const show = await axios.get(showUrl);
            const showName = show.data.name;
            let showNode = {"name": showName, "size": 1};
            charChild.children.push(showNode);
          }
          castChildren.push(charChild);
        }
        child.children = castChildren;
      } else if(child.name === "Crew") {
          let crewChildren = [];

          for(let z = 0; z < child.children.length; z++) {
            let crewMember = child.children[z];
            let role = crewMember.type;
            let name = crewMember.person.name;

            let roleNode = {"name": role, "children": []};
            crewChildren.push(roleNode);
            let crewNode = {"name": name, "size": 1};
            roleNode.children.push(crewNode);
          }

        child.children = crewChildren;
      }
    }

    renderSunburst(nodeData);
  };
  
  
  const showButton = document.getElementById("findShow");
  showButton.addEventListener("keypress", function (e) {
    let key = e.which || e.keyCode || 0;

    if (key === 13) {
      getShow();
    }

  });
  showButton.addEventListener("click", getShow);

});



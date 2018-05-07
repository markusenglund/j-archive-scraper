const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");

const latestGameId = 5972;
/*
clue = { clue, answer, category, value, isDailyDouble, round, gameId, airDate }

*/

const fetchGameData = gameId => {
  axios
    .get(`http://www.j-archive.com/showgame.php?game_id=${gameId}`)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const categories = [];
      $(".category_name").each(function() {
        categories.push($(this).text());
      });
      console.log(categories);

      const clues = [];
      $(".clue_text").each(function() {
        clues.push($(this).text());
      });
      console.log(clues);
    });
};

fetchGameData(latestGameId);

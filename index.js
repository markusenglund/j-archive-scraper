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
      $(".clue_text").each(function(i) {
        const clue = $(this).text();
        let category;
        let round;
        let value;
        if (i < 30) {
          category = categories[i % 6];
          round = "j";
          value = Math.floor(i / 6 + 1) * 200;
        } else if (i < 60) {
          category = categories[i % 6 + 6];
          round = "dj";
          value = Math.floor((i - 30) / 6 + 1) * 400;
        } else if (i === 60) {
          category = categories[12];
          round = "fj";
        }

        clues.push({ clue, category, round, value });
      });
      // console.log(clues);
    });
};

fetchGameData(latestGameId);

const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const parseDate = require("date-fns/parse");
const pMap = require("p-map");

const fetchGameData = gameId => {
  return axios
    .get(`http://www.j-archive.com/showgame.php?game_id=${gameId}`)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const clues = [];

      const airDateString = $("#game_title")
        .text()
        .split(" - ")[1];
      const airDate = parseDate(
        airDateString,
        "dddd, MMMM D, YYYY",
        new Date()
      );

      const categories = [];
      $(".category_name").each(function() {
        categories.push($(this).text());
      });

      $(".clue").each(function(i, elem) {
        // Calculate category, round and value based off of index of clue
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

        const clue = cheerio(".clue_text", elem).html();

        // Get response by accessing the onmouseover value and parsing it as a cheerio object
        let response;
        if (i < 60) {
          const mouseOverContent = cheerio("div", elem).attr("onmouseover");
          // console.log(mouseOverContent);
          response = cheerio(".correct_response", mouseOverContent).text();
        } else if (i === 60) {
          const mouseOverContent = $(".final_round div").attr("onmouseover");
          response = cheerio("em", mouseOverContent).text();
        }

        // Check if clue was daily double
        const isDailyDouble = !!cheerio(".clue_value_daily_double", elem)
          .length;

        if (clue !== "") {
          clues.push({
            clue,
            response,
            category,
            isDailyDouble,
            round,
            value,
            airDate,
            gameId
          });
        }
      });
      if (gameId % 5 === 0) {
        console.log(gameId);
      }
      return clues;
    })
    .catch(() => {
      console.log("ERROR", gameId);
    });
};

// Use p-map to throttle http requests to j-archive to avoid timeouts
pMap(new Array(5972), (_, i) => fetchGameData(i + 1), { concurrency: 15 })
  .then(games => games.reduce((acc, game) => acc.concat(game), []))
  .then(clues => {
    console.log("DONE!");
    fs.writeFileSync("clues.json", JSON.stringify(clues));
  });

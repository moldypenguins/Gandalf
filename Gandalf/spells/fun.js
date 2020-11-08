const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const bent = require('bent');

var Fun_gif_usage = entities.encode('!giphy <phrase>');
var Fun_gif_desc = 'Finds a random gifphy using your phrase';
var Fun_gif = (args) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Fun_gif_desc); }
    let phrase = args.join('+');
    let search_url = `http://api.giphy.com/v1/gifs/search?q=${phrase}&api_key=${config.giphy.key}&rating=r&limit=10`;
    
    const getStream = bent('string');
    var gif = await getStream(search_url);
    
    if(gif != undefined) {
      var content = body.data[getRandomInt(body.data.length-1)].images.original_mp4.mp4;
      resolve(content);
    } else {
      console.log(error);
      resolve(`Didnt find dick for that.`);
    }
      
  });
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
  "giphy": { usage: Fun_gif_usage, description: Fun_gif_desc, cast: Fun_gif, send_as_video: true },
  "gif": { usage: Fun_gif_usage, description: Fun_gif_desc, cast: Fun_gif, send_as_video: true },
};

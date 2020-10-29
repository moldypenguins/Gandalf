const config = require('../../config');
const numeral = require('numeral');
const moment = require('moment');
const qs = require("querystring");
const request = require('request');

var Fun_gif_usage = qs.encode('!giphy <phrase>');
var Fun_gif_desc = 'Finds a random gifphy using your phrase';
var Fun_gif = (args) => {

    return new Promise(function (resolve, reject) {
        if (!Array.isArray(args) || args.length < 1) { reject(Fun_gif_desc); }
        let phrase = args.join('+');
        let search_url = `http://api.giphy.com/v1/gifs/search?q=${phrase}&api_key=${config.giphy.key}&rating=r&limit=10`;
        request({ url: search_url, json: true }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.data.length != 0) {
		console.log(body.data);
                    var content = body.data[getRandomInt(body.data.length-1)].images.original_mp4.mp4;
	console.log(content);
                    resolve(content);
                } else {
                    resolve(`Didnt find dick for that.`);
                }
            }
            else {
                console.error(error);
                resolve(`Didnt find dick for that.`);
            }
        });
    });
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
    "giphy": { usage: Fun_gif_usage, description: Fun_gif_desc, cast: Fun_gif, send_as_video: true },
    "gif": { usage: Fun_gif_usage, description: Fun_gif_desc, cast: Fun_gif, send_as_video: true },
};

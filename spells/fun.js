/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/gpl-3.0.html
 **/
const config = require('../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
import {encode} from 'html-entities';

const bent = require('bent');

var Fun_gif_usage = encode('!giphy <phrase>');
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

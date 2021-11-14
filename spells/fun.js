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
 *
 * @name fun.js
 * @version 2021/06/07
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const bent = require('bent');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomizedGiphy(body) {
  return body.data[getRandomInt(body.data.length - 1)];
}

async function search(phrase, key) {
  const search_url = `http://api.giphy.com/v1/gifs/search?q=${phrase}&api_key=${key}&rating=r&limit=50`;
  const getStream = bent('string');
  const body = JSON.parse(await getStream(search_url));
  if (body) {
    const data = getRandomizedGiphy(body);
    if (data && data.images) {
      return data.images.original_mp4.mp4;
    }
  }

  //if it didnt return anything use the 404 search term
  return search('404', key);
}

let Fun_gief_usage = he.encode('!gief');
let Fun_gief_desc = 'Finds a random gifphy using your phrase';
let Fun_gief = (args) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Fun_gief_desc); }
    resolve('boobs', CFG.giphy.key);
  });
};

let Fun_giphy_usage = he.encode('!giphy <phrase>');
let Fun_giphy_desc = 'Finds a random giphy using your phrase';
let Fun_giphy = (args) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Fun_giphy_desc); }
    resolve(await search(args.join('+'), CFG.giphy.key));
  });
};

module.exports = {
  "gief": { usage: Fun_gief_usage, description: Fun_gief_desc, cast: Fun_gief, send_as_video: true },
  "giphy": { usage: Fun_giphy_usage, description: Fun_giphy_desc, cast: Fun_giphy, send_as_video: true },
};

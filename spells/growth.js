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
 * @name growth.js
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


var Growth_epenis_usage = he.encode('!epenis [user]');
var Growth_epenis_desc = 'Score growth of user\'s planet over last 72 ticks.';
var Growth_epenis = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};


var Growth_bigdicks_usage = he.encode('!bigdicks');
var Growth_bigdicks_desc = 'Shows the current biggest five epenii in the alliance.';
var Growth_bigdicks = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};


var Growth_loosecunts_usage = he.encode('!loosecunts');
var Growth_loosecunts_desc = 'Shows the current smallest five epenii in the alliance.';
var Growth_loosecunts = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};



module.exports = {
  "epenis": { usage: Growth_epenis_usage, description: Growth_epenis_desc, cast: Growth_epenis },
  "bigdicks": { usage: Growth_bigdicks_usage, description: Growth_bigdicks_desc, cast: Growth_bigdicks },
  "loosecunts": { usage: Growth_loosecunts_usage, description: Growth_loosecunts_desc, cast: Growth_loosecunts },
}



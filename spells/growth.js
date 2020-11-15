const config = require('../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();


var Growth_epenis_usage = entities.encode('!epenis [user]');
var Growth_epenis_desc = 'Score growth of user\'s planet over last 72 ticks.';
var Growth_epenis = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};


var Growth_bigdicks_usage = entities.encode('!bigdicks');
var Growth_bigdicks_desc = 'Shows the current biggest five epenii in the alliance.';
var Growth_bigdicks = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};


var Growth_loosecunts_usage = entities.encode('!loosecunts');
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



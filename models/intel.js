var mongoose = require('../db.js');

var intelSchema = mongoose.Schema({
  planet_id: Number,
  alliance_id: Number,
  nick: String,
  fakenick: String,
  defwhore: Boolean,
  covop: Boolean,
  amps: Number,
  dists: Number,
  bg: String,
  gov: String,
  relay: Boolean,
  reportchan: String,
  comment: String
});

module.exports = mongoose.model('Intel', intelSchema, 'Intels');


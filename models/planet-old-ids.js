var mongoose = require('../db.js');

var planetOldIdSchema = mongoose.Schema({
  id: Number,
  x: Number,
  y: Number,
  z: Number,
  planetname: String,
  rulername: String,
  race: String,
  size: Number,
  score: Number,
  value: Number,
  xp: Number,
  vdiff: Number
});

module.exports = mongoose.model('PlanetOldId', planetOldIdSchema, 'PlanetOldIds');


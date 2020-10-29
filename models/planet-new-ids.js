var mongoose = require('../db.js');

var planetNewIdSchema = mongoose.Schema({
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
  xp: Number
});

module.exports = mongoose.model('PlanetNewId', planetNewIdSchema, 'PlanetNewIds');


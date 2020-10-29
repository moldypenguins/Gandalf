var mongoose = require('../db.js');

var planetExileSchema = mongoose.Schema({
  hour: Number,
  tick: Number,
  id: Number,
  oldx: Number,
  oldy: Number,
  oldz: Number,
  newx: Number,
  newy: Number,
  newz: Number,
});

module.exports = mongoose.model('PlanetExile', planetExileSchema, 'PlanetExiles');


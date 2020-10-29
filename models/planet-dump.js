var mongoose = require('../db.js');

var planetDumpSchema = mongoose.Schema({
  planet_id: { type: String },
  id: { type: String },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  planetname: { type: String },
  rulername: { type: String },
  race: { type: String },
  size: { type: Number },
  score: { type: Number },
  value: { type: Number },
  xp: { type: Number }
});

module.exports = mongoose.model('PlanetDump', planetDumpSchema, 'PlanetDumps');


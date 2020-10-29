var mongoose = require('../db.js');

var galaxyDumpSchema = mongoose.Schema({
  galaxy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Galaxy" },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  name: { type: String },
  size: { type: Number },
  score: { type: Number },
  value: { type: Number },
  xp: { type: Number }
});

module.exports = mongoose.model('GalaxyDump', galaxyDumpSchema, 'GalaxyDumps');


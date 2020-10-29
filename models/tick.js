var mongoose = require('mongoose');

var tickSchema = mongoose.Schema({
  id:         Number,
  galaxies:   Number,
  planets:    Number,
  alliances:  Number,
  timestamp:  Date,
  clusters:   Number,
  c200:       Number,
  ter:        Number,
  cat:        Number,
  xan:        Number,
  zik:        Number,
  etd:        Number
});

module.exports = mongoose.model('Tick', tickSchema, 'Ticks');


var mongoose = require('../db.js');

var attackSchema = mongoose.Schema({
  id: Number,
  hash: String,
  landtick: Number,
  waves: Number,
  releasetick: Number,
  title: String,
  comment: String,
  createtick: Number,
  commander_id: Number
});

module.exports = mongoose.model('Attack', attackSchema, 'Attacks');


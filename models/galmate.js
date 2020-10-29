var mongoose = require('../db.js');

var galmateSchema = mongoose.Schema({
  id:         Number,
  username:   String,
  first_name: String,
  last_name:  String,
  photo_url:  String
});

module.exports = mongoose.model('GalMate', galmateSchema, 'GalMates');


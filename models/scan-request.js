const config = require('../config.js');
const mongoose = require('../db.js');
const Member = require('./member');
const BotMessage = require('./botmessage');

var scanRequestSchema = mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  z: Number,
  requester_id: Number,
  planet_id: String,
  scantype: Number,
  dists: Number,
  scan_id: Number,
  active: Boolean,
  tick: Number
});

module.exports = mongoose.model('ScanRequest', scanRequestSchema, 'ScanRequests');



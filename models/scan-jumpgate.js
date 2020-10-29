var mongoose = require('../db.js');

var jumpgateProbeSchema = mongoose.Schema({
  scan_id: {type: String, index: true},
  owner_id: Number,
  target_id: Number,
  fleet_size: Number,
  fleet_name: String,
  launch_tick: Number,
  landing_tick: Number,
  mission: String,
  in_cluster: Boolean,
  in_galaxy: Boolean
});

module.exports = mongoose.model('JumpgateProbe', jumpgateProbeSchema, 'JumpgateProbes');


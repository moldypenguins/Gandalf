var mongoose = require('../db.js');

var planetScanSchema = mongoose.Schema({
  scan_id: {type: String, index: true},
  roid_metal: Number,
  roid_crystal: Number,
  roid_eonium: Number,
  res_metal: Number,
  res_crystal: Number,
  res_eonium: Number,
  factory_usage_light: String,
  factory_usage_medium: String,
  factory_usage_heavy: String,
  prod_res: Number,
  ships_sold_res: Number,
  agents: Number,
  guards: Number
});

module.exports = mongoose.model('PlanetScan', planetScanSchema, 'PlanetScans');


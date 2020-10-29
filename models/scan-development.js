var mongoose = require('../db.js');

var developmentScanSchema = mongoose.Schema({
  scan_id: {type: String, index: true},
  light_factory: Number,
  medium_factory: Number,
  heavy_factory: Number,
  wave_amplifier: Number,
  wave_distorter: Number,
  metal_refinery: Number,
  crystal_refinery: Number,
  eonium_refinery: Number,
  research_lab: Number,
  finance_centre: Number,
  military_centre: Number,
  security_centre: Number,
  structure_defence: Number,
  travel: Number,
  infrastructure: Number,
  hulls: Number,
  waves: Number,
  core: Number,
  covert_op: Number,
  mining: Number,
  population: Number
});

module.exports = mongoose.model('DevelopmentScan', developmentScanSchema, 'DevelopmentScans');


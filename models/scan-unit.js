var mongoose = require('../db.js');

var unitScanSchema = mongoose.Schema({
  scan_id: {type: String, index: true},
  ship_id: Number,
  amount: Number
});

unitScanSchema.index({scan_id:1, ship_id:1}, {unique:true});

module.exports = mongoose.model('UnitScan', unitScanSchema, 'UnitScans');


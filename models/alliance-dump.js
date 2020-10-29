var mongoose = require('../db.js');

var allianceDumpSchema = mongoose.Schema({
  alliance_id: { type: mongoose.Schema.Types.ObjectId, ref: "Alliance" },
  name: { type: String, required: true },
  size: { type: Number },
  members: { type: Number },
  score: { type: Number },
  points: { type: Number },
  score_rank: { type: Number },
  size_avg: { type: Number },
  score_avg: { type: Number },
  points_avg: { type: Number }
});

module.exports = mongoose.model('AllianceDump', allianceDumpSchema, 'AllianceDumps');


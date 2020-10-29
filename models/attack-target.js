var mongoose = require('../db.js');

var attackTargetSchema = mongoose.Schema({
  attack_id: Number,
  planet_id: String
});

module.exports = mongoose.model('AttackTarget', attackTargetSchema, 'AttackTargets');


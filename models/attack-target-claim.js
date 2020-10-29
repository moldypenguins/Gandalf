var mongoose = require('../db.js');

var attackTargetClaimSchema = mongoose.Schema({
  member_id: Number,
  attack_id: Number,
  planet_id: String,
  wave: Number
});

attackTargetClaimSchema.index({attack_id:1, planet_id:1, wave:1}, {unique:true});

module.exports = mongoose.model('AttackTargetClaim', attackTargetClaimSchema, 'AttackTargetClaims');


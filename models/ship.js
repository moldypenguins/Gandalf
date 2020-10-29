var mongoose = require('mongoose');

var ShipSchema = mongoose.Schema({
  id:         {type:Number, unique:true, required:true},
  name:       {type:String, index:true},
  race:       String,
  class:      String,
  target1:    String,
  target2:    String,
  target3:    String,
  type:       String,
  initiative: String,
  guns:       String,
  armor:      String,
  damage:     String,
  empres:     String,
  metal:      String,
  crystal:    String,
  eonium:     String,
  armorcost:  String,
  damagecost: String,
  baseeta:    String
});

module.exports = mongoose.model('Ship', ShipSchema, 'Ships');



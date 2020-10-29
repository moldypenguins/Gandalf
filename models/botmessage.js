var mongoose = require('../db.js');

var botmessageSchema = mongoose.Schema({
  id:        String,
  group_id:  Number,
  message:   String,
  sent:      Boolean
});

module.exports = mongoose.model('BotMessage', botmessageSchema, 'BotMessages');


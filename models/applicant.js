var mongoose = require('../db.js');

var applicantSchema = mongoose.Schema({
  id:         Number,
  username:   String,
  first_name: String,
  last_name:  String,
  photo_url:  String,
  rejected:   Boolean
});

module.exports = mongoose.model('Applicant', applicantSchema, 'Applicants');


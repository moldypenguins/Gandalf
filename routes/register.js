const config = require('../config');
const db = require('../db');
const Member = require('../models/member');
const Applicant = require('../models/applicant');
const express = require('express');
let router = express.Router();
const util = require('util');

router.get("/", (req, res, next) => {
  if (typeof(req.session.applicant) == 'undefined' && typeof(req.session.visitor) == 'undefined') {
    next(400); 
  } else { 
    //console.log('REGISTER VISITOR: ' + req.session.visitor);
    res.render('register', { });
  }
});


router.post("/", (req, res, next) => {
  console.log('SESSION VISITOR: ' + util.inspect(req.session.visitor, false, null, true));
  console.log('POST BODY APPLICANT: ' + util.inspect(req.body, false, null, true));
  let applcnt = new Applicant({ 
    id: req.session.visitor.id, 
    username: req.session.visitor.username,
    first_name: req.session.visitor.first_name, 
    last_name: req.session.visitor.last_name, 
    photo_url: req.session.visitor.photo_url != undefined ? req.session.visitor.photo_url : '/images/member.jpg'
  });
  applcnt.save(function (err, saved) {
    if (err) return console.error(err);
    console.log(saved.id + " saved to Applicants collection.");
    req.session.applicant = saved;
    res.render('register', { applicant: saved });
  });
});


module.exports = router;

/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @name register.js
 * @version 2021/06/07
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
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

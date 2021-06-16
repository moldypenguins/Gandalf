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

const Member = require('../models/Member');
const Applicant = require('../models/Applicant');

const express = require('express');
let router = express.Router();
const util = require('util');


/**
 * GET /reg
 */
router.get("/", async (req, res, next) => {
  if(typeof(req.session.visitor) !== 'undefined') {
    console.log('REGISTER VISITOR: ' + req.session.visitor);
    res.render('register', {});
  } else if(typeof(req.session.applicant) !== 'undefined') {
    console.log('REGISTER APPLICANT: ' + req.session.applicant);
    res.render('register', {});
  } else {
    next(400);
  }
});

/**
 * POST /reg
 */
router.post("/", async (req, res, next) => {
  console.log('SESSION VISITOR: ' + util.inspect(req.session.visitor, false, null, true));
  console.log('POST BODY APPLICANT: ' + util.inspect(req.body, false, null, true));
  let applcnt = await new Applicant({
    _id: Mordor.Types.ObjectId(),
    telegram_id: req.session.visitor.id,
    telegram_username: req.session.visitor.username,
    telegram_first_name: req.session.visitor.first_name,
    telegram_last_name: req.session.visitor.last_name,
    telegram_photo_url: req.session.visitor.photo_url !== undefined ? req.session.visitor.photo_url : '/images/member.jpg'
  });
  await applcnt.save();
  console.log(applcnt.telegram_id + " saved to Applicants collection.");
  req.session.applicant = applcnt;
  res.render('register', { applicant: applcnt });
});


module.exports = router;

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
 * @version 2021/07/08
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const Mordor = require('../Mordor');

const Member = require('../models/Member');
const Applicant = require('../models/Applicant');

const express = require('express');
let router = express.Router();
const util = require('util');
const TelegramUser = require("../models/TelegramUser");


/**
 * GET /reg
 */
router.get("/", async (req, res, next) => {
  if(typeof(req.session.visitor) !== 'undefined') {
    console.log('SESSION VISITOR: ' + util.inspect(req.session.visitor, false, null, true));
    res.render('register', {});
  } else if(typeof(req.session.applicant) !== 'undefined') {
    if(req.session.applicant.rejected !== true) {
      console.log('SESSION APPLICANT: ' + util.inspect(req.session.visitor, false, null, true));
      res.render('register', {});
    } else {
      console.log('SESSION REJECTED APPLICANT: ' + util.inspect(req.session.visitor, false, null, true));
      res.render('register', {});
    }
  } else {
    next(400);
  }
});


/**
 * POST /reg
 */
router.post("/", async (req, res, next) => {
  console.log('POST VISITOR: ' + util.inspect(req.session.visitor, false, null, true));

  if(!await TelegramUser.exists({telegram_id:req.session.visitor.id})) {
    await new TelegramUser({
      _id:Mordor.Types.ObjectId(),
      telegram_id: req.session.visitor.id,
      telegram_username: req.session.visitor.username,
      telegram_first_name: req.session.visitor.first_name,
      telegram_last_name: req.session.visitor.last_name,
      telegram_photo_url: req.session.visitor.photo_url !== undefined ? req.session.visitor.photo_url : '/images/member.jpg'
    }).save();
  }
  let tg_user = await TelegramUser.findOne({telegram_id:req.session.visitor.id});
  console.log('TGUSER: ' + util.inspect(tg_user, false, null, true));

  if (!await Applicant.exists({telegram_user:tg_user})) {
    if (await new Applicant({_id:Mordor.Types.ObjectId(), telegram_user:tg_user, access: 0, pa_nick:req.body.pa_nick}).save()) {
      console.log(`Added ${req.body.pa_nick} to Applicants collection.`);
    } else {
      console.log(`Could not add ${req.body.pa_nick} to Applicants collection.`);
    }
  } else {
    console.log(`Applicant ${req.body.pa_nick} already exists.`);
  }
  //let applicant = await Applicant.findOne({telegram_user:telegramUser});
  /*
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
  */
  res.locals.visitor = undefined;
  req.session.applicant = applcnt;
  res.render('register', { applicant: applcnt});
});


module.exports = router;

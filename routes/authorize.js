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
 * @name authorize.js
 * @version 2021/06/19
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const Mordor = require('../Mordor');

const Member = require('../models/Member');
const Applicant = require('../models/Applicant');
const TelegramUser = require('../models/TelegramUser');

const crypto = require('crypto');
const express = require('express');
let router = express.Router();
const util = require('util');


function checkSignature({ hash, ...data }) {
  const secret = crypto.createHash('sha256')
    .update(CFG.bot.token)
    .digest();
  const checkString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  return hmac === hash;
}


/**
 * GET /auth
 */
router.get("/", async (req, res, next) => {
  if(checkSignature(req.query)) {
    //successful login
    let params = JSON.parse(JSON.stringify(req.query));

    let telegramUser = await TelegramUser.findOneAndUpdate({telegram_id: params.id},{
      telegram_first_name:params.first_name,
      telegram_last_name:params.last_name,
      telegram_username:params.username,
      telegram_photo_url:params.photo_url,
    },{upsert:true, new:true});

    console.log('TGUSER: ' + util.inspect(Mordor.Types.ObjectId(telegramUser._id), false, null, true));

    let member = await Member.findOne({telegram_user:telegramUser._id}).populate('telegram_user');
    console.log('MEMBER: ' + util.inspect(member, false, null, true));
    //console.log('PARAMS: ' + util.inspect(params, false, null, true));
    if (member && false) {
      console.log('Is Member');
      req.session.member = member;
      res.redirect("/");
    } else {
      let applicant = await Applicant.findOne({telegram_user: telegramUser._id});
      if (applicant) {
        console.log('Is Applicant');
        req.session.applicant = applicant;
      } else {
        console.log('Is Visitor');
        req.session.visitor = params;
      }
      res.redirect("/reg");
    }
  } else {
    //failed login
    next(401);
  }
  //res.redirect("/");
});


module.exports = router;

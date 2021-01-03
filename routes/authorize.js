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
 **/
const config = require('../config');
const Member = require('../models/member');
const Applicant = require('../models/applicant');
const crypto = require('crypto');
const express = require('express');
let router = express.Router();
const util = require('util');


function checkSignature({ hash, ...data }) {
  const secret = crypto.createHash('sha256')
    .update(config.bot.token)
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


router.get("/", async (req, res, next) => {
  if(checkSignature(req.query)) {
    //successful login
    var params = JSON.parse(JSON.stringify(req.query));
    var member = await Member.findOne({id: params.id});
    if(member) {
      console.log('Is Member');
      await Member.updateOne({id: params.id}, {username: params.username, first_name: params.first_name, last_name: params.last_name, photo_url: params.photo_url});
      req.session.member = member;
      res.redirect("/");
    } else {
      var applicant = await Applicant.findOne({id: params.id});
      if(applicant) {
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


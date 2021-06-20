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
 * @name profile.js
 * @version 2021/06/20
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const Member = require('../models/Member');
const Applicant = require('../models/Applicant');
const Planet = require('../models/Planet');

const express = require('express');
let router = express.Router();
const util = require('util');
const moment = require('moment-timezone');
const createError = require("http-errors");


/**
 * GET /profile
 */
router.get('/', async (req, res, next) => {
  //console.log('MEMBER: ' + util.inspect(res.locals.member, false, null, true));
  let mem = req.session.member;
  if(mem) {
    //mem.planet = await Planet.findOne({id: req.session.member.planet_id});
  }
  res.render('profile', { page: 'profile', post_action: '/profile', profile: res.locals.member, themes: CFG.web.themes, timezones: moment.tz.names() });
});


/**
 * POST /profile
 */
router.post('/', async (req, res, next) => {
  if(req.session.member !== undefined) {
    //console.log('REQBODY: ' + util.inspect(req.body, true, null, true));
    let plnt;
    if(req.body.planet_x !== undefined && req.body.planet_y !== undefined && req.body.planet_z !== undefined) {
      plnt = await Planet.findOne({x: req.body.planet_x, y: req.body.planet_y, z: req.body.planet_z});
    }
    //console.log('PLANET: ' + util.inspect(plnt, false, null, true));
    let upd = await Member.updateOne({id: req.session.member.id}, {
      site_theme: req.body.site_theme,
      site_navigation: req.body.site_navigation,
      pa_nick: req.body.pa_nick,
      timezone: req.body.timezone,
      phone: req.body.full_phone,
      email: req.body.email,
      planet: plnt
    });
    let saved = await Member.findOne({id: req.session.member.id});
    console.log(saved.id + " profile updated.");
    req.session.member = saved;
    res.redirect('/profile');
  } else {
    next(createError(400));
  }
});


module.exports = router;

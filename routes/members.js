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
 * @name members.js
 * @version 2021/07/11
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const Member = require('../models/Member');
const Inactive = require('../models/Inactive');
const Applicant = require('../models/Applicant');
const Planet = require('../models/Planet');
const GalMate = require('../models/GalMate');

const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const moment = require('moment');
const util = require('util');
const FNCS = require("../Functions");
const client = require('twilio')(CFG.twilio.sid, CFG.twilio.secret);
//var VoiceResponse = twilio.twiml.VoiceResponse;

router.get('/', AXS.webMemberRequired, async (req, res, next) => {
  let mems = await Member.find().populate('telegram_user').populate('planet');
  //let plnts = await Planet.find();
  let inact = await Inactive.find().populate('telegram_user');
  let apps = await Applicant.find().populate('telegram_user');
  let glm8s = await GalMate.find().populate('telegram_user');
  mems.forEach((m) => {
    if(m.telegram_user) {
      m.telegram_user.telegram_name = FNCS.getTelegramName(m.telegram_user);
    }
    //if(m.planet_id !== undefined && plnts.some(p => p.id === m.planet_id)) { m.planet = plnts.find(p => p.id === m.planet_id); }
    //TODO: add below to model member.getRank()
    let rolesString = [];
    if(m.access === 5) {
      rolesString.push("ADM");
    }
    if(m.access >= 3 && (m.roles & 16) !== 0) {
      rolesString.push("HC");
    }
    if(m.access >= 3 && (m.roles & 8) !== 0) {
      rolesString.push("DC");
    }
    if(m.access >= 3 && (m.roles & 4) !== 0) {
      rolesString.push("BC");
    }
    if(m.access >= 3 && rolesString.length <= 0) {
      rolesString.push("CMDR");
    }
    if(m.access >= 1 && (m.roles & 2) !== 0) {
      rolesString.push("SCNR");
    } 
    if(m.access >= 1 && (m.roles & 1) !== 0) {
      rolesString.push("OOT");
    } 
    if(m.access >= 1 && rolesString.length <= 0) {
      rolesString.push("MEM");
    }
    if(m.access < 1 && rolesString.length <= 0) {
      rolesString.push("RCRT");
    }
    m.accessRoles = rolesString.join(', ');
  });
  glm8s.forEach((gm8) => {
    if(gm8.telegram_user) {
      gm8.telegram_user.telegram_name = FNCS.getTelegramName(gm8.telegram_user);
    }
  });

  res.render('members', { members: mems, inactives: inact, applicants: apps, galmates: glm8s, access: CFG.access, moment: moment });
});


router.post('/', AXS.webHighCommandRequired, async(req, res, next) => {
  //console.log('BODY: ' + util.inspect(req.body, false, null, true));
  if(req.body.deactivate !== undefined) {
    let mbr = await Member.findOne({id: req.body.deactivate});
    if(mbr != null) {
      let inatv = new Inactive({
        id: mbr.id,
        username: mbr.username,
        first_name: mbr.first_name,
        last_name: mbr.last_name,
        photo_url: mbr.photo_url,
        pa_nick: mbr.pa_nick,
        email: mbr.email,
        phone: mbr.phone,
        sponsor: mbr.sponsor,
        timezone: mbr.timezone
      });
      inatv.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        //console.log(saved.username + " saved to Inactives collection.");
        Member.deleteOne({id: req.body.deactivate}, function(err) {
          if (err) return console.error(err);
          res.redirect('/mem');
        });
      });
    }
  }
});


router.post('/applicants', AXS.webHighCommandRequired, async (req, res, next) => {
  console.log(util.inspect(req.body, false, null, true));
  if(req.body.accept !== undefined) {
    Applicant.findOne({id: req.body.accept}).then((applcnt) => {
      console.log('applcnt: ' + applcnt);
      if(applcnt) {
        let mem = new Member({
          id: applcnt.id,
          username: applcnt.username,
          first_name: applcnt.first_name,
          last_name: applcnt.last_name,
          photo_url: applcnt.photo_url,
          access: 0,
          roles:0,
          site_navigation: CFG.web.default_navigation,
          site_theme: CFG.web.default_theme
        });
        mem.save(function (err, saved) {
          if(err) {
            console.log(err);
            return;
          }
          console.log(saved.username + " saved to Members collection.");
          Applicant.deleteOne({id: req.body.accept}, function(err) {
            if (err) return console.error(err);
            res.redirect('/mem');
          });
        });
      }
    });
  } else if(req.body.reject !== undefined) {
    Applicant.findOne({id: req.body.reject}).then((applcnt) => {
      applcnt.rejected = true;
      applcnt.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        console.log(saved.username + " has been rejected.");
        res.redirect('/mem');
      });
    });
  } else {
    next(createError(400));
  }
});


router.post('/inactives', AXS.webHighCommandRequired, async (req, res, next) => {
  if(req.body.activate !== undefined) {
    let inact = await Inactive.findOne({id: req.body.activate});
    if(inact != null) {
      let mbr = new Member({
        id: inact.id,
        username: inact.username,
        first_name: inact.first_name,
        last_name: inact.last_name,
        photo_url: inact.photo_url,
        pa_nick: inact.pa_nick,
        email: inact.email,
        phone: inact.phone,
        sponsor: inact.sponsor,
        timezone: inact.timezone,
        access: 0,
        roles: 0
      });
      mbr.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        //console.log(saved.username + " saved to Members collection.");
        Inactive.deleteOne({id: req.body.activate}, function(err) {
          if (err) return console.error(err);
          res.redirect('/mem');
        });
      });
    }
  } else if(req.body.delete !== undefined) {
    let rem = await Inactive.deleteOne({id: req.body.delete});
    console.log(req.body.delete + " deleted.");
    res.redirect('/mem');
  }
});


router.get('/:id', AXS.webHighCommandRequired, async (req, res, next) => {
  let mem = await Member.findById(req.params.id);
  //console.log('PLANET: ' + util.inspect(mem, false, null, true));
  if(mem) {
    mem.telegram_user.telegram_name = FNCS.getTelegramName(mem.telegram_user);
    //console.log('TG NAME: ' + util.inspect(mem.telegram_user.telegram_name, false, null, true));
    //if(mem.planet_id !== undefined) {
    //  mem.planet = await Planet.findOne({id:mem.planet_id});
    //}
    //console.log('PLANET: ' + util.inspect(plnt, false, null, true));
    res.render('profile', { site_title: CFG.alliance.name, page_title: 'Edit Member', page: 'member', post_action: '/mem/' + mem.id, profile: mem, themes: CFG.web.themes, timezones: moment.tz.names() });
  } else {
    next(createError(400));
  }
});


router.post('/:id', AXS.webHighCommandRequired, async (req, res, next) => {
  if(req.body !== undefined) {
    //console.log('BODY: ' + util.inspect(req.body, false, null, true));
    let mem = await Member.findById(req.params.id);
    if(req.body.pa_nick !== undefined) { mem.pa_nick = req.body.pa_nick; }
    if(req.body.access !== undefined) { mem.access = req.body.access; }
    if(req.body.role1 !== undefined || req.body.role2 !== undefined || req.body.role4 !== undefined || req.body.role8 !== undefined || req.body.role16 !== undefined) {
      mem.roles = 
        (req.body.role1 !== undefined ? 1 : 0) +
        (req.body.role2 !== undefined ? 2 : 0) +
        (req.body.role4 !== undefined ? 4 : 0) +
        (req.body.role8 !== undefined ? 8 : 0) +
        (req.body.role16 !== undefined ? 16 : 0);
      //console.log('ROLES: ' + util.inspect(mem.roles, false, null, true));
    }
    if(req.body.full_phone !== undefined) { mem.phone = req.body.full_phone; }
    if(req.body.email !== undefined) { mem.email = req.body.email; }
    if(req.body.planet_x !== undefined && req.body.planet_y !== undefined && req.body.planet_z !== undefined) {
      let plnt = await Planet.findOne({x: req.body.planet_x, y: req.body.planet_y, z: req.body.planet_z});
      mem.planet = plnt ? plnt : null;
    }
    let upd = await mem.save();
    console.log(mem.pa_nick + " profile updated.");
    res.redirect('/mem');
  } else {
    next(createError(400));
  }
});


router.post('/galmate', AXS.webAdminRequired, async (req, res, next) => {
  if(req.body !== undefined && req.body.delete !== undefined) {
    let gm = await GalMate.deleteOne({id: req.body.delete});
    console.log(req.body.delete + " deleted.");
    res.redirect('/mem');
  } else {
    next(createError(400));
  }
});


router.get('/call/:id', AXS.webCommandRequired, async (req, res, next) => {
  comms.callMember(req.params.id).then((response) => {
      console.log(message.responseText);
      response.send({
          message: 'Successful',
      });
  }, (error) => {
      console.log(error);
      response.status(500).send(error);
  });
});


module.exports = router;

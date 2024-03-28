/**
 * Gandalf
 * Copyright (C) 2020 Gandalf Planetarion Tools
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
 * @version 2024/01/12
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
const Mordor = require("../Mordor");
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
  apps.forEach((a) => {
    if (a.telegram_user) {
      a.telegram_user.telegram_name = FNCS.getTelegramName(a.telegram_user);
    }
  });
  glm8s.forEach((gm8) => {
    if(gm8.telegram_user) {
      gm8.telegram_user.telegram_name = FNCS.getTelegramName(gm8.telegram_user);
    }
  });

  res.render('members', { members: mems, inactives: inact, applicants: apps, galmates: glm8s, access: CFG.access, moment: moment });
});


router.post('/', AXS.webHighCommandRequired, async(req, res, next) => {
  console.log('BODY: ' + util.inspect(req.body, false, null, true));
  console.log(req.body.deactivate);
  if(req.body.deactivate !== undefined) {
    let mbr = await Member.findOne({_id: req.body.deactivate});
    if(mbr != null) {
      let inatv = new Inactive({
        _id: mbr._id,
        pa_nick: mbr.pa_nick,
        telegram_user: mbr.telegram_user,
        discord_user: mbr.discord_user,
        parent: mbr.parent,
        birthed: mbr.birthed,
        photo_url: mbr.photo_url,
        email: mbr.email,
        phone: mbr.phone,
        timezone: mbr.timezone
      });
      inatv.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        console.log(saved.pa_nick + " saved to Inactives collection.");
        Member.deleteOne({_id: req.body.deactivate}, function(err) {
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
    Applicant.findById(req.body.accept).then((applcnt) => {
      console.log('applcnt: ' + applcnt);
      if(applcnt) {
        let mem = new Member({
          _id: Mordor.Types.ObjectId(),
          pa_nick: applcnt.pa_nick,
          telegram_user: applcnt.telegram_user,
          parent: req.session.member.telegram_user,
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
          console.log(saved.pa_nick + " saved to Members collection.");
          Applicant.deleteOne({_id: req.body.accept}, function(err) {
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
        console.log(saved.pa_nick + " has been rejected.");
        res.redirect('/mem');
      });
    });
  } else {
    next(createError(400));
  }
});


router.post('/inactives', AXS.webHighCommandRequired, async (req, res, next) => {
  if(req.body.activate !== undefined) {
    let inact = await Inactive.findOne({_id: req.body.activate});
    if(inact != null) {
      let mbr = new Member({
        _id: inact._id,
        pa_nick: inact.pa_nick,
        telegram_user: inact.telegram_user,
        discord_user: inact.discord_user,
        photo_url: inact.photo_url,
        parent: inact.parent,
        birthed: inact.birthed,
        email: inact.email,
        phone: inact.phone,
        timezone: inact.timezone,
        access: 0,
        roles: 0
      });
      mbr.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        //console.log(saved.pa_nick + " saved to Members collection.");
        Inactive.deleteOne({_id: req.body.activate}, function(err) {
          if (err) return console.error(err);
          res.redirect('/mem');
        });
      });
    }
  } else if(req.body.delete !== undefined) {
    let rem = await Inactive.deleteOne({_id: req.body.delete});
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

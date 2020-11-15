const config = require('../config');
const db = require('../db');
const Member = require('../models/member');
const Inactive = require('../models/inactive');
const Applicant = require('../models/applicant');
const Planet = require('../models/planet');
const GalMate = require('../models/galmate');
const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const access = require('access');
const moment = require('moment');
const util = require('util');
const client = require('twilio')(config.twilio.sid, config.twilio.secret);
//var VoiceResponse = twilio.twiml.VoiceResponse;

router.get('/', access.webMemberRequired, async (req, res, next) => {
  let mems = await Member.find();
  let inact = await Inactive.find();
  let plnts = await Planet.find();
  let glm8s = await GalMate.find();
  mems.forEach((m) => {
    if(m.planet_id != undefined && plnts.some(p => p.id == m.planet_id)) {
      m.planet = plnts.find(p => p.id == m.planet_id);
    }
    var rolesString = [];
    if(m.access == 5) {
      rolesString.push("ADM");
    }
    if(m.access >= 3 && (m.roles & 16) != 0) {
      rolesString.push("HC");
    }
    if(m.access >= 3 && (m.roles & 8) != 0) {
      rolesString.push("DC");
    }
    if(m.access >= 3 && (m.roles & 4) != 0) {
      rolesString.push("BC");
    }
    if(m.access >= 3 && rolesString.length <= 0) {
      rolesString.push("CMDR");
    }
    if(m.access >= 1 && (m.roles & 2) != 0) {
      rolesString.push("SCNR");
    } 
    if(m.access >= 1 && (m.roles & 1) != 0) {
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
  let apps = await Applicant.find();
  res.render('members', { members: mems, inactives: inact, applicants: apps, galmates: glm8s, access: config.access, moment: moment });
});


router.post('/', access.webHighCommandRequired, async (req, res, next) => {
  console.log('BODY: ' + util.inspect(req.body, false, null, true));
  if(req.body.deactivate != undefined) {
    Member.findOne({id: req.body.deactivate}).then((mbr) => {
      if(mbr) {
        let inatv = new Inactive({
          id: mbr.id,
          username: mbr.username,
          first_name: mbr.first_name,
          last_name: mbr.last_name,
          photo_url: mbr.photo_url,
          panick: mbr.panick,
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
          console.log(saved.username + " saved to Members collection.");
          Member.deleteOne({id: req.body.deactivate}, function(err) {
            if (err) return console.error(err);
            res.redirect('/members');
          });
        });
      }
    });
  }
});


router.post('/applicants', access.webHighCommandRequired, async (req, res, next) => {
  console.log(util.inspect(req.body, false, null, true));
  if(req.body.accept != undefined) {
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
          active: 1
        });
        mem.save(function (err, saved) {
          if(err) {
            console.log(err);
            return;
          }
          console.log(saved.username + " saved to Members collection.");
          Applicant.deleteOne({id: req.body.accept}, function(err) {
            if (err) return console.error(err);
            res.redirect('/members');
          });
        });
      }
    });
  } else if(req.body.reject != undefined) {
    Applicant.findOne({id: req.body.reject}).then((applcnt) => {
      applcnt.rejected = true;
      applcnt.save(function (err, saved) {
        if(err) {
          console.log(err);
          return;
        }
        console.log(saved.username + " has been rejected.");
        res.redirect('/members');
      });
    });
  } else {
    next(createError(400));
  }
});


router.post('/inactives', access.webHighCommandRequired, async (req, res, next) => {
  if(req.body.activate != undefined) {
    
  } else if(req.body.remove != undefined) {
    
  }
});


router.get('/:id', access.webHighCommandRequired, async (req, res, next) => {
  let mem = await Member.findOne({id:req.params.id});
  //console.log('PLANET: ' + util.inspect(mem, false, null, true));
  if(mem) {
    if(mem.planet_id != undefined) {
      mem.planet = await Planet.findOne({id:mem.planet_id});
    }
    //console.log('PLANET: ' + util.inspect(plnt, false, null, true));
    res.render('profile', { site_title: config.alliance.name, page_title: 'Edit Member', page: 'member', post_action: '/members/' + mem.id, profile: mem });
  } else {
    next(createError(400));
  }
});


router.post('/:id', access.webHighCommandRequired, async (req, res, next) => {
  if(req.body != undefined) {
    console.log('BODY: ' + util.inspect(req.body, false, null, true));
    let mem = await Member.findOne({id: req.params.id});
    if(req.body.panick != undefined) { mem.panick = req.body.panick; }
    if(req.body.active != undefined) { mem.active = req.body.active; }
    if(req.body.access != undefined) { mem.access = req.body.access; }
    if(req.body.role1 != undefined || req.body.role2 != undefined || req.body.role4 != undefined || req.body.role8 != undefined || req.body.role16 != undefined) { 
      mem.roles = 
        (req.body.role1 != undefined ? 1 : 0) + 
        (req.body.role2 != undefined ? 2 : 0) + 
        (req.body.role4 != undefined ? 4 : 0) + 
        (req.body.role8 != undefined ? 8 : 0) + 
        (req.body.role16 != undefined ? 16 : 0); 
      console.log('ROLES: ' + util.inspect(mem.roles, false, null, true));
    }
    if(req.body.phone != undefined) { mem.phone = req.body.phone; }
    if(req.body.email != undefined) { mem.email = req.body.email; }
    if(req.body.planet_x != undefined && req.body.planet_y != undefined && req.body.planet_z != undefined) {
      plnt = await Planet.findOne({x: req.body.planet_x, y: req.body.planet_y, z: req.body.planet_z});
      mem.planet_id = plnt ? plnt.id : null;
    }
    let upd = await mem.save();
    console.log(mem.id + " profile updated.");
    res.redirect('/members');
  } else {
    next(createError(400));
  }
});


router.post('/galmate/:id', access.webAdminRequired, async (req, res, next) => {
  if(req.body != undefined && req.body.delete != undefined) {
    let gm = await GalMate.deleteOne({id: req.params.id});
    console.log(req.params.id + " deleted.");
    res.redirect('/members');
  } else {
    next(createError(400));
  }
});


router.get('/call/:id', access.webCommandRequired, async (req, res, next) => {
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


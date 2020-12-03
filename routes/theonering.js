const config = require('../config');
const db = require('../db');
const Member = require('../models/member');
const Applicant = require('../models/applicant');
const Planet = require('../models/planet');
const express = require('express');
let router = express.Router();
const util = require('util');
const fs = require('fs');
const csrf = require('csurf')

const csrfProtection = csrf({ cookie: true });

//router.get('/', csrfProtection, async (req, res, next) => {
router.get('/', async (req, res, next) => {
  fs.access('views/content/dashboard.html', fs.constants.F_OK, (err) => {
    //res.render('dashboard', { csrfToken: req.csrfToken(), content_exists: err ? false : true });
    res.render('dashboard', { content_exists: !err });
  });
});

router.get("/logout", async (req, res) => {
  req.session.member = undefined;
  res.redirect("/");
});

router.get('/covops', async (req, res, next) => {
  res.render('covops', { });
});

router.get('/bgs', async (req, res, next) => {
  res.render('battlegroups', { });
});


//##########################
// PROFILE
//##########################
router.get('/profile', async (req, res, next) => {
  //console.log('PLANET: ' + util.inspect(req.session.member, false, null, true));
  let mem = req.session.member;
  if(mem) {
    mem.planet = await Planet.findOne({id: req.session.member.planet_id});
  }
  res.render('profile', { page: 'profile', post_action: '/profile', profile: req.session.member });
});

router.post('/profile', async (req, res, next) => {
  if(req.session.member !== undefined) {
    //console.log('REQBODY: ' + util.inspect(req.body, true, null, true));
    let plnt;
    if(req.body.planet_x !== undefined && req.body.planet_y !== undefined && req.body.planet_z !== undefined) {
      plnt = await Planet.findOne({x: req.body.planet_x, y: req.body.planet_y, z: req.body.planet_z});
    }
    let upd = await Member.updateOne({id: req.session.member.id}, {
      site_theme: req.body.theme,
      panick: req.body.panick,
      phone: req.body.full_phone,
      email: req.body.email,
      planet_id: plnt ? plnt.id : null
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


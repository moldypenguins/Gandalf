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
const Ship = require('../models/ship');
const Attack = require('../models/attack');
const AttackTarget = require('../models/attack-target');
const AttackTargetClaim = require('../models/attack-target-claim');
const Planet = require('../models/planet');
const Scan = require('../models/scan');
const PlanetScan = require('../models/scan-planet');
const DevelopmentScan = require('../models/scan-development');
const UnitScan = require('../models/scan-unit');
const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const access = require('../access');
const crypto = require("crypto");
const numeral = require('numeral');
const util = require('util');
const rateLimit = require("express-rate-limit");

const attackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 5, // start blocking after 5 requests
  message: "Too many refreshes, please try again after 5 minutes",
  keyGenerator: (req, res) => {
    return req.ip + '-' + req.params.hash;
  }
});


router.get('/', async (req, res, next) => {
  var attacks = await Attack.find().sort({id: -1});
  res.render('attacks', { page: 'all', attacks: attacks, after_land_ticks: config.alliance.attack.after_land_ticks });
});

router.get('/new', access.webCommandRequired, async (req, res, next) => {
  let tks = [];
  for(let i = res.locals.tick.id; i <= config.pa.tick.end; i++) {
    tks.push(i);
  }
  res.render('attacks', { page: 'new', ticks: tks, waves: config.alliance.attack.default_waves, min_uni_eta: config.pa.ships.min_uni_eta });
});

router.post('/new', access.webCommandRequired, async (req, res, next) => {
  if(req.body.save != undefined) {
    let lastatt = await Attack.findOne().sort({id: -1});
    lastatt = lastatt ? lastatt.id : 0;
    
    let att = new Attack({
      id: lastatt + 1,
      hash: crypto.randomBytes(16).toString('hex'),
      landtick: req.body.landtick,
      waves: req.body.waves,
      releasetick: req.body.releasetick,
      title: req.body.title,
      comment: req.body.comment,
      createtick: res.locals.tick.id,
      commander_id: res.locals.member.id
    });
    let saved = await att.save();
    if(saved) {
      //console.log("Attack #" + saved.id + " saved to Attacks collection.");
      res.redirect(`/att/edit/${saved.hash}`);
    } else {
      next(createError(400));
    }
  } else {
    next(createError(401));
  }
});

router.get('/edit/:hash', access.webCommandRequired, async (req, res, next) => {
  var att = await Attack.findOne({hash:req.params.hash});
  var atttarg = await AttackTarget.find({attack_id:att.id});
  var targs = await Planet.find({id:{$in:atttarg.map(at => at.planet_id)}});
  let tks = [];
  for(let i = att.createtick; i <= config.pa.tick.end; i++) {
    tks.push(i);
  }
  res.render('attacks', { page: 'edit', attack: att, targets: targs, ticks: tks, waves: config.alliance.attack.default_waves, min_uni_eta: config.pa.ships.min_uni_eta, numeral: numeral });
});

router.post('/edit/:hash', access.webCommandRequired, async (req, res, next) => {
  let att = await Attack.updateOne({hash:req.params.hash}, {
    landtick: req.body.landtick,
    waves: req.body.waves,
    releasetick: req.body.releasetick,
    title: req.body.title,
    comment: req.body.comment
  });
  //console.log(util.inspect(att, false, null, true));
  if(att.nModified > 0) {
    let saved = await Attack.findOne({hash:req.params.hash});
    //console.log("Attack #" + saved.id + " saved to Attacks collection.");
    res.redirect(`/att/${saved.hash}`);
  } else {
    next(createError(500));
  }
});

router.post('/edit/targ/:hash', access.webCommandRequired, async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  if(req.body.add != undefined && req.body.coords != undefined){
    let inCoords = req.body.coords.split(' ');
    //console.log('COORDS' + util.inspect(inCoords, false, null, true));
    for(let x = 0; x < inCoords.length; x++) {
      //console.log(`${x}: ` + util.inspect(inCoords[x], false, null, true));
      if (inCoords[x].match(/^\d+:\d+:\*$/g) != null) {
        //galaxy
        //console.log('GAL: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split(':');
        let plnts = await Planet.find({ x: cds[0], y: cds[1] });
        for (let i = 0; i < plnts.length; i++) {
          let trg = new AttackTarget({ attack_id: att.id, planet_id: plnts[i].id });
          let saved = await trg.save();
        }
      } else if (inCoords[x].match(/^\d+\.\d+\.\*$/g) != null) {
        //galaxy
        //console.log('GAL: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split('.');
        let plnts = await Planet.find({ x: cds[0], y: cds[1] });
        for (let i = 0; i < plnts.length; i++) {
          let trg = new AttackTarget({ attack_id: att.id, planet_id: plnts[i].id });
          let saved = await trg.save();
        }
      } else if(inCoords[x].match(/^\d+:\d+:\d+-\d+$/g) != null) {
        //planet range
        //console.log('RNG: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split(':');
        let pts = cds[2].split('-');
        var plnts = await Planet.find({x:cds[0], y:cds[1], z:{$gte:pts[0], $lte:pts[1]}});
        for(let i = 0; i < plnts.length; i++) {
	        let trg = new AttackTarget({attack_id:att.id, planet_id:plnts[i].id});
          await trg.save();
        }
      } else if(inCoords[x].match(/^\d+:\d+:\d+$/g) != null) {
        //planet
        //console.log('PNT: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split(':');
        let plnt = await Planet.findOne({x:cds[0], y:cds[1], z:cds[2]});
        let trg = new AttackTarget({attack_id:att.id, planet_id:plnt.id});
        await trg.save();
      } else if (inCoords[x].match(/^\d+\.\d+\.\d+$/g) != null) {
        let cds = inCoords[x].split('.');
        let plnt = await Planet.findOne({ x: cds[0], y: cds[1], z: cds[2] });
        let trg = new AttackTarget({ attack_id: att.id, planet_id: plnt.id });
        await trg.save();
      }
    }
    res.redirect(`/att/edit/${req.params.hash}`);
  } else if(req.body.delete != undefined) {
    let att = await Attack.findOne({hash:req.params.hash});
    let claims = await AttackTargetClaim.deleteMany({ attack_id:att.id, planet_id:req.body.delete });
    let trg = await AttackTarget.deleteOne({attack_id:att.id, planet_id:req.body.delete});
    res.redirect(`/att/edit/${req.params.hash}`);
  } else {
    next(createError(400));
  }
});




router.get('/:hash', attackLimiter, async (req, res, next) => {
  var mems = await Member.find();
  var att = await Attack.findOne({hash:req.params.hash});
  var atttarg = await AttackTarget.find({attack_id:att.id});
  var targs = await Planet.find({id:{$in:atttarg.map(at => at.planet_id)}});
  var clms = await AttackTargetClaim.find({attack_id:att.id});
  for(let i = 0; i < targs.length; i++) {
    targs[i].scans = {};
    targs[i].scans.p = await Scan.findOne({planet_id:targs[i].id, scantype:1}).sort({tick:-1, _id:-1});
    if(targs[i].scans.p != undefined) { targs[i].scans.p.scan = await PlanetScan.findOne({scan_id:targs[i].scans.p.id}); }
    targs[i].scans.d = await Scan.findOne({planet_id:targs[i].id, scantype:3}).sort({tick:-1, _id:-1});
    if(targs[i].scans.d != undefined) { targs[i].scans.d.scan = await DevelopmentScan.findOne({scan_id:targs[i].scans.d.id}); }
    targs[i].scans.u = await Scan.findOne({planet_id:targs[i].id, scantype:4}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.u != undefined) { targs[i].scans.u.scan = await UnitScan.findOne({scan_id:targs[i].scans.u.id}); }
    targs[i].scans.n = await Scan.findOne({planet_id:targs[i].id, scantype:5}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.n != undefined) { targs[i].scans.n.scan = await NewsScan.findOne({scan_id:targs[i].scans.n.id}); }
    targs[i].scans.j = await Scan.findOne({planet_id:targs[i].id, scantype:7}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.j != undefined) { targs[i].scans.j.scan = await JumpgateProbe.findOne({scan_id:targs[i].scans.j.id}); }
    targs[i].scans.a = await Scan.findOne({planet_id:targs[i].id, scantype:8}).sort({tick:-1, _id:-1});
    if(targs[i].scans.a != undefined) { 
      targs[i].scans.a.scan = await UnitScan.find({scan_id:targs[i].scans.a.id}); 
      for(let j = 0; j < targs[i].scans.a.scan.length; j++) {
        targs[i].scans.a.scan[j].ship = await Ship.findOne({id:targs[i].scans.a.scan[j].ship_id});
        //console.log('SHIP: ' + util.inspect(targs[i].scans.a.scan[j], false, null, true));
      }
      targs[i].anti = {};
      targs[i].anti.fi = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "fighter" || shp.ship.target2.toLowerCase() == "fighter" || shp.ship.target3.toLowerCase() == "fighter"))) { targs[i].anti.fi = true; }
      targs[i].anti.co = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "corvette" || shp.ship.target2.toLowerCase() == "corvette" || shp.ship.target3.toLowerCase() == "corvette"))) { targs[i].anti.co = true; }
      targs[i].anti.fr = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "frigate" || shp.ship.target2.toLowerCase() == "frigate" || shp.ship.target3.toLowerCase() == "frigate"))) { targs[i].anti.fr = true; }
      targs[i].anti.de = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "destroyer" || shp.ship.target2.toLowerCase() == "destroyer" || shp.ship.target3.toLowerCase() == "destroyer"))) { targs[i].anti.de = true; }
      targs[i].anti.cr = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "cruiser" || shp.ship.target2.toLowerCase() == "cruiser" || shp.ship.target3.toLowerCase() == "cruiser"))) { targs[i].anti.cr = true; }
      targs[i].anti.bs = false; if(targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() == "battleship" || shp.ship.target2.toLowerCase() == "battleship" || shp.ship.target3.toLowerCase() == "battleship"))) { targs[i].anti.bs = true; }
    }
    //targs[i].bashlimit = 0.16;
  }
  //console.log('MEMBERS: ' + util.inspect(mems, false, null, true));
  res.render('attacks', { page: 'att', attack: att, races:config.pa.races, targets: targs, claims: clms, numeral: numeral, scanurl: config.pa.links.scans, bcalcurl: config.pa.links.bcalc, expiries: config.pa.scans, members:mems, scantypes:config.pa.scantypes });
});

router.post('/:hash', async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  if(att.releasetick > res.locals.tick.id) {
    next(createError(403));
  } else {
    if (req.body.claim != undefined && req.body.target != undefined) {
      let claims = await AttackTargetClaim.find({ attack_id: att.id });
      //console.log(`claims length: ${claims.length}`);
      let claim_count = claims.filter(c => c.member_id == req.session.member.id).length;
      //console.log(`claim count ${claim_count}`);
      let exists = await AttackTargetClaim.findOne({ member_id: req.session.member.id, attack_id: att.id, planet_id: req.body.target, wave: req.body.claim });
      if (config.alliance.attack.max_claims > 0 && claim_count >= config.alliance.attack.max_claims) {
        //console.log(`rejecting new claim, over limit`);
        next(createError(403, `Only ${max_claims} claims is allowed!!`));
      } else if(exists == null) {
        try {
          var clm = new AttackTargetClaim({
            member_id:req.session.member.id,
            attack_id:att.id,
            planet_id:req.body.target,
            wave:req.body.claim
          });
          let saved = await clm.save();
          //console.log('CLAIM: ' + util.inspect(saved, false, null, true));
          res.redirect(`/att/${att.hash}`);
        } catch(err) {
          next(createError(409));
        }
      }
    } else if(req.body.drop != undefined && req.body.target != undefined) { 
      let deleted = await AttackTargetClaim.deleteOne({member_id:req.session.member.id, attack_id:att.id, planet_id:req.body.target, wave:req.body.drop});
      //console.log('DROP: ' + util.inspect(deleted, false, null, true));
      res.redirect(`/att/${att.hash}`);
    } else {
      next(createError(400));
    }
  }
});

module.exports = router;

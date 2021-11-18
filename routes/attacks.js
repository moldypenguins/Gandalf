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
 * @name attacks.js
 * @version 2021/06/07
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const Mordor = require("../Mordor");
const AXS = require('../Access');

const Member = require('../models/Member');
const Ship = require('../models/Ship');
const Attack = require('../models/Attack');
const AttackTarget = require('../models/AttackTarget');
const AttackTargetClaim = require('../models/AttackTargetClaim');
const Planet = require('../models/Planet');
const Scan = require('../models/Scan');
const PlanetScan = require('../models/ScanPlanet');
const DevelopmentScan = require('../models/ScanDevelopment');
const UnitScan = require('../models/ScanUnit');
const Intel = require('../models/Intel');
const Alliance = require('../models/Alliance');

const createError = require('http-errors');
const express = require('express');
let router = express.Router();

const crypto = require("crypto");
const numeral = require('numeral');
const util = require('util');
//const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

/*
const attackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 5, // start blocking after 5 requests
  message: "Too many refreshes, please try again after 5 minutes",
  keyGenerator: (req, res) => {
    return req.ip + '-' + req.params.hash;
  }
});
*/
const attackLimiter = slowDown({
  windowMs: 2 * 60 * 1000, // 2 minutes
  delayAfter: 5, // allow 5 requests to go at full-speed, then...
  delayMs: 100 // 6th request has a 100ms delay, 7th has a 200ms delay, 8th gets 300ms, etc.
});

router.get('/', async (req, res, next) => {
  let attacks = await Attack.find().sort({number: -1});
  res.render('attacks', { page: 'all', attacks: attacks, after_land_ticks: CFG.alliance.attack.after_land_ticks });
});

router.get('/new', AXS.webCommandRequired, async (req, res, next) => {
  let tks = [];
  for(let i = res.locals.tick.tick; i <= PA.tick.end; i++) {
    tks.push(i);
  }
  res.render('attacks', { page: 'new', ticks: tks, waves: CFG.alliance.attack.default_waves, min_uni_eta: PA.ships.min_uni_eta });
});

router.post('/new', AXS.webCommandRequired, async (req, res, next) => {
  if(req.body.save !== undefined) {
    let lastatt = await Attack.findOne().sort({id: -1});
    lastatt = lastatt ? lastatt.id : 0;
    
    let att = await new Attack({
      _id: new Mordor.Types.ObjectId(),
      number: lastatt + 1,
      hash: crypto.randomBytes(16).toString('hex'),
      landtick: req.body.landtick,
      waves: req.body.waves,
      releasetick: req.body.releasetick,
      title: req.body.title,
      comment: req.body.comment,
      createtick: res.locals.tick.tick,
      commander_id: res.locals.member.id
    }).save();
    if(att) {
      console.log("Attack #" + att.number + " saved to Attacks collection.");
      res.redirect(`/att/edit/${att.hash}`);
    } else {
      next(createError(400));
    }
  } else {
    next(createError(401));
  }
});

let addIntel = async (target) => {
  let intel = await Intel.findOne({planet_id: target.id});
  target.intel = {};
  if (intel) {
//    console.log(intel);
    if (intel.alliance_id) {
      let alliance = await Alliance.findOne({ _id: intel.alliance_id});
  //    console.log(alliance)
      target.intel.alliance = alliance.name;
    } else {
      target.intel.alliance = "-"
    }
    target.intel.nick = intel.nick ? intel.nick : '-';
  }
  return target;
}


router.get('/edit/:hash', AXS.webCommandRequired, async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  let atttarg = await AttackTarget.find({attack:att});
  let targs = await Planet.find({planet_id:{$in:atttarg.map(at => at.planet.planet_id)}});
  for(let target of targs) {
    await addIntel(target);
  }
  let tks = [];
  for(let i = att.createtick; i <= PA.tick.end; i++) {
    tks.push(i);
  }
  res.render('attacks', { page: 'edit', attack: att, targets: targs, ticks: tks, waves: CFG.alliance.attack.default_waves, min_uni_eta: PA.ships.min_uni_eta, numeral: numeral });
});

router.post('/edit/:hash', AXS.webCommandRequired, async (req, res, next) => {
  await Attack.updateOne({hash:req.params.hash}, {
    landtick: req.body.landtick,
    waves: req.body.waves,
    releasetick: req.body.releasetick,
    title: req.body.title,
    comment: req.body.comment
  });
  res.redirect(`/att/${req.params.hash}`);
});

router.post('/edit/targ/:hash', AXS.webCommandRequired, async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  if(req.body.add !== undefined && req.body.coords !== undefined){
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
          let trg = new AttackTarget({_id: new Mordor.Types.ObjectId(), attack: att, planet: plnts[i] });
          let saved = await trg.save();
        }
      } else if (inCoords[x].match(/^\d+\.\d+\.\*$/g) != null) {
        //galaxy
        //console.log('GAL: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split('.');
        let plnts = await Planet.find({ x: cds[0], y: cds[1] });
        for (let i = 0; i < plnts.length; i++) {
          let trg = new AttackTarget({_id: new Mordor.Types.ObjectId(), attack: att, planet: plnts[i] });
          let saved = await trg.save();
        }
      } else if(inCoords[x].match(/^\d+:\d+:\d+-\d+$/g) != null) {
        //planet range
        //console.log('RNG: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split(':');
        let pts = cds[2].split('-');
        var plnts = await Planet.find({x:cds[0], y:cds[1], z:{$gte:pts[0], $lte:pts[1]}});
        for(let i = 0; i < plnts.length; i++) {
	        let trg = new AttackTarget({_id: new Mordor.Types.ObjectId(),attack:att, planet:plnts[i]});
          await trg.save();
        }
      } else if(inCoords[x].match(/^\d+:\d+:\d+$/g) != null) {
        //planet
        console.log('PNT: ' + util.inspect(inCoords[x], false, null, true));
        let cds = inCoords[x].split(':');
        let plnt = await Planet.findOne({x:cds[0], y:cds[1], z:cds[2]});
        let trg = new AttackTarget({_id: new Mordor.Types.ObjectId(),attack:att, planet:plnt});
        await trg.save();
      } else if (inCoords[x].match(/^\d+\.\d+\.\d+$/g) != null) {
        let cds = inCoords[x].split('.');
        let plnt = await Planet.findOne({ x: cds[0], y: cds[1], z: cds[2] });
        let trg = new AttackTarget({_id: new Mordor.Types.ObjectId(), attack: att, planet: plnt });
        await trg.save();
      }
    }
    res.redirect(`/att/edit/${req.params.hash}`);
  } else if(req.body.delete !== undefined) {
    let plnt = await Planet.findOne({planet_id:req.body.delete});
    let att = await Attack.findOne({hash:req.params.hash});
    let claims = await AttackTargetClaim.deleteMany({attack:att, planet:plnt});
    let trg = await AttackTarget.deleteOne({attack:att, planet:plnt});
    res.redirect(`/att/edit/${req.params.hash}`);
  } else {
    next(createError(400));
  }
});


router.post('/delete/:hash', AXS.webCommandRequired, async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  if(req.body.delete !== undefined) {
    let claims = await AttackTargetClaim.deleteMany({ attack_id:att.id });
    let trg = await AttackTarget.deleteMany({attack_id:att.id});
    let deleted = await Attack.deleteOne({id:att.id});
    res.redirect(`/att`);
  } else {
    next(createError(400));
  }
});



router.get('/:hash', attackLimiter, async (req, res, next) => {
  let mems = await Member.find();
  let att = await Attack.findOne({hash:req.params.hash});
  let atttarg = await AttackTarget.find({attack:att});
  let targs = await Planet.find({planet_id:{$in:atttarg.map(at => at.planet.planet_id)}});
  let clms = await AttackTargetClaim.find({attack:att});
  for(let target of targs) {
    await addIntel(target);
  }
  for(let i = 0; i < targs.length; i++) {
    targs[i].scans = {};
    targs[i].scans.p = await Scan.findOne({planet_id:targs[i].id, scantype:1}).sort({tick:-1, _id:-1});
    if(targs[i].scans.p != null) { targs[i].scans.p.scan = await PlanetScan.findOne({scan_id:targs[i].scans.p.id}); }
    targs[i].scans.d = await Scan.findOne({planet_id:targs[i].id, scantype:3}).sort({tick:-1, _id:-1});
    if(targs[i].scans.d != null) { targs[i].scans.d.scan = await DevelopmentScan.findOne({scan_id:targs[i].scans.d.id}); }
    targs[i].scans.u = await Scan.findOne({planet_id:targs[i].id, scantype:4}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.u != undefined) { targs[i].scans.u.scan = await UnitScan.findOne({scan_id:targs[i].scans.u.id}); }
    targs[i].scans.n = await Scan.findOne({planet_id:targs[i].id, scantype:5}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.n != undefined) { targs[i].scans.n.scan = await NewsScan.findOne({scan_id:targs[i].scans.n.id}); }
    targs[i].scans.j = await Scan.findOne({planet_id:targs[i].id, scantype:7}).sort({tick:-1, _id:-1});
    //if(targs[i].scans.j != undefined) { targs[i].scans.j.scan = await JumpgateProbe.findOne({scan_id:targs[i].scans.j.id}); }
    targs[i].scans.a = await Scan.findOne({planet_id:targs[i].id, scantype:8}).sort({tick:-1, _id:-1});
    if(targs[i].scans.a != null) {
      targs[i].scans.a.scan = await UnitScan.find({scan_id:targs[i].scans.a.id}); 
      for(let j = 0; j < targs[i].scans.a.scan.length; j++) {
        targs[i].scans.a.scan[j].ship = await Ship.findOne({id:targs[i].scans.a.scan[j].ship_id});
        //console.log('SHIP: ' + util.inspect(targs[i].scans.a.scan[j], false, null, true));
      }
      targs[i].anti = {};
      targs[i].anti.fi = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "fighter" || shp.ship.target2.toLowerCase() === "fighter" || shp.ship.target3.toLowerCase() === "fighter"));
      targs[i].anti.co = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "corvette" || shp.ship.target2.toLowerCase() === "corvette" || shp.ship.target3.toLowerCase() === "corvette"));
      targs[i].anti.fr = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "frigate" || shp.ship.target2.toLowerCase() === "frigate" || shp.ship.target3.toLowerCase() === "frigate"));
      targs[i].anti.de = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "destroyer" || shp.ship.target2.toLowerCase() === "destroyer" || shp.ship.target3.toLowerCase() === "destroyer"));
      targs[i].anti.cr = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "cruiser" || shp.ship.target2.toLowerCase() === "cruiser" || shp.ship.target3.toLowerCase() === "cruiser"));
      targs[i].anti.bs = !!targs[i].scans.a.scan.find(shp => shp.ship != null && (shp.ship.target1.toLowerCase() === "battleship" || shp.ship.target2.toLowerCase() === "battleship" || shp.ship.target3.toLowerCase() === "battleship"));
    }
    targs[i].bashlimit = targs[i].value <= req.session.member.planet.value * PA.bash.value && targs[i].score <= req.session.member.planet.score * PA.bash.score;

  }
  const sortedTargs = [...targs].sort((a, b) => { return a.x - b.x || a.y - b.y || a.z -b.z; });
  //console.log('MEMBERS: ' + util.inspect(mems, false, null, true));
  res.render('attacks', { page: 'att', attack: att, races:PA.races, targets: sortedTargs, claims: clms, numeral: numeral, scanurl: PA.links.scans, bcalcurl: PA.links.bcalc, expiries: PA.scans, members:mems, scantypes:PA.scantypes });
});

router.post('/:hash', async (req, res, next) => {
  let att = await Attack.findOne({hash:req.params.hash});
  if(att.releasetick > res.locals.tick.tick) {
    next(createError(403));
  } else {
    let plnt = await Planet.findOne({planet_id: req.body.target});
    if (req.body.claim !== undefined && req.body.target !== undefined) {
      let claims = await AttackTargetClaim.find({ attack: att });
      //console.log(`claims length: ${claims.length}`);
      let claim_count = claims.filter(c => c.member.pa_nick === req.session.member.pa_nick).length;
      //console.log(`claim count ${claim_count}`);
      let exists = await AttackTargetClaim.findOne({ member: req.session.member, attack: att, planet: plnt, wave: req.body.claim });
      if (CFG.alliance.attack.max_claims > 0 && claim_count >= CFG.alliance.attack.max_claims) {
        //console.log(`rejecting new claim, over limit`);
        next(createError(403, `Only ${max_claims} claims allowed!!`));
      } else if(exists == null) {
        try {
          let clm = new AttackTargetClaim({
            _id: new Mordor.Types.ObjectId(),
            member:req.session.member,
            attack:att,
            planet:plnt,
            wave:req.body.claim
          });
          console.log(clm);
		      let saved = await clm.save();
          //console.log('CLAIM: ' + util.inspect(saved, false, null, true));
          res.redirect(`/att/${att.hash}`);
        } catch(err) {
		      console.log(err);
          next(createError(409));
        }
      }
    } else if(req.body.drop !== undefined && req.body.target !== undefined) {
      let deleted = await AttackTargetClaim.deleteOne({member:req.session.member, attack:att, planet:plnt, wave:req.body.drop});
      //console.log('DROP: ' + util.inspect(deleted, false, null, true));
      res.redirect(`/att/${att.hash}`);
    } else {
      next(createError(400));
    }
  }
});


module.exports = router;

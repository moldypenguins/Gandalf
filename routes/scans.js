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
 * @name scans.js
 * @version 2021/06/07
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const Mordor = require('../Mordor');
const AXS = require('../Access');

const Scan = require('../models/Scan');
const ScanRequest = require('../models/ScanRequest');
const PlanetScan = require('../models/ScanPlanet');
const DevelopmentScan = require('../models/ScanDevelopment');
const BotMessage = require('../models/BotMessage');
const Planet = require('../models/Planet');
const Member = require('../models/Member');

const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const url = require("url");
const moment = require('moment-timezone');
const util = require('util');
const crypto = require("crypto");
const bent = require('bent');
const getStream = bent('string');


function compareAmps( a, b ) {
  let rtn = 0;
  if(a.scans.d?.scan !== undefined && a.scans.d.scan.wave_amplifier > b.scans.d.scan.wave_amplifier) {
    rtn =  -1;
  } else if(b.scans.d?.scan !== undefined && b.scans.d.scan.wave_amplifier > a.scans.d.scan.wave_amplifier) {
    rtn =  1;
  }
  return rtn;
}


router.get('/', async (req, res, next) => {
  let scnrs = await Member.find({$where:`this.access >= 1 && (this.roles & 2) !== 0`});
  for(let i = 0; i < scnrs.length; i++) {
    //scnrs[i].planet = await Planet.findOne({id:scnrs[i].planet_id});
    scnrs[i].scans = {};
    scnrs[i].scans.d = await Scan.findOne({planet_id:scnrs[i].planet.planet_id, scantype:3}).sort({tick:-1, _id:-1});
    //console.log('D SCAN: ' + util.inspect(PA.scnrs[i].scans.d, false, null, true));
    if(scnrs[i].scans.d !== null) { scnrs[i].scans.d.scan = await DevelopmentScan.findOne({scan_id:scnrs[i].scans.d.scan_id}); }
    if(scnrs[i].timezone !== undefined) { let tz = moment().tz(scnrs[i].timezone); scnrs[i].currenttime = tz !== undefined ? tz.format('LT') : null; }
  }
  scnrs.sort(compareAmps);
  let reqs = await ScanRequest.find({active: true});
  res.render('scans', { scanners: scnrs, requests: reqs, scantypes:PA.scantypes });
});


router.get('/parse', AXS.webScannerRequired, async (req, res, next) => {
  if(req.query.url === undefined) {
    next(createError(400));
  } else {
    const start_time = Date.now();
    console.log('Sauron Forging The One Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);

    let scanurl = url.parse(req.query.url, true);
    //console.log('SCAN_ID: ' + scanurl.query.scan_id);
    //console.log('SCAN_GRP: ' + scanurl.query.scan_grp);

    let page_content = await getStream(scanurl.href);
    console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);

    if(scanurl.query.scan_id !== undefined) {
      //scan
      try {
        let result = await Scan.parse(req.session.member.id, scanurl.query.scan_id, null, page_content);
        //console.log('RESULT: ' + result);
      } catch(err) {
        next(err);
      }
    }

    if(scanurl.query.scan_grp !== undefined) {
      //group
      let scans = page_content.split("<hr>");
      for(let i = 1; i < scans.length; i++) {
        let m = scans[i].match(/scan_id=([0-9a-zA-Z]+)/i);
        if(m != null) {
          //console.log('M: ' +  util.inspect(m, false, null, true));
          try {
            let result = await Scan.parse(req.session.member.id, m[1], scanurl.query.scan_grp, scans[i]);
          } catch(err) {
            next(err);
          }
        }
      }
    }

    console.log(`Parsed scan(s) in: ${Date.now() - start_time}ms`);

    res.redirect('/scans');
  }
});


router.post('/parse', AXS.webScannerRequired, async (req, res, next) => {
  if(req.body.scan_ids !== undefined && req.body.scan_ids.length > 0) {
    const start_time = Date.now();
    console.log('Sauron Forging The One Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);
    //console.log('SESSION: ' + util.inspect(res.locals, false, null, true));

    for(var j = 0; j < req.body.scan_ids.length; j++) {
      if(!await Scan.exists({id:req.body.scan_ids[j]})) {
          let scanurl = url.parse(PA.links.scans + '?scan_id=' + req.body.scan_ids[j], true);
          let page_content = await getStream(scanurl.href);
          console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);

          if(scanurl.query.scan_id !== undefined) {
            try {
              let result = await Scan.parse(res.locals.member.id, scanurl.query.scan_id, null, page_content);
              // check if any outstanding scan requests for this!!
              let requests = await ScanRequest.find({active:true,planet_id:result.planet_id});
              for(var request in requests) {
                // find the planet and send the message to whoever requested it
                let planet = await Planet.findOne({id: request.planet_id});
                let text = `Your scan request for ${planet.x}:${planet.y}:${planet.z} has been fullfilled: https://game.planetarion.com/showscan.pl?scan_id=${result.id}`;
                let msg = new BotMessage({id:crypto.randomBytes(8).toString("hex"), group_id: request.requester_id, message: text, sent: false});
                await msg.save();
                // turn it off
                request.active = false;
                await request.save();
              }
              //console.log('RESULT: ' + result);
            } catch(err) {
              console.log(`Error: ${err}`);
            }
          }
      }
    }
    console.log(`Parsed scan(s) in: ${Date.now() - start_time}ms`);
    res.sendStatus(204);
  }
});

router.get('/requests', AXS.webScannerRequired, async (req, res) => {
  let requests = await ScanRequest.find({active: true});
  res.send(requests);
});

router.post('/request', async(req, res, next) => {
  if(req.body.coords_x !== undefined && req.body.coords_y !== undefined && req.body.coords_z !== undefined && req.body.scantype !== undefined) {
    let plnt = await Planet.findOne({x:req.body.coords_x, y:req.body.coords_y, z:req.body.coords_z});
    if(plnt == null) {
      next(createError(400));
    } else {
      let scanreq = new ScanRequest({
        _id: Mordor.Types.ObjectId(),
        request_id: crypto.randomBytes(8).toString("hex"),
        planet_id: plnt.planet_id,
        x: plnt.x,
        y: plnt.y,
        z: plnt.z,
        scantype: req.body.scantype,
        active: true,
        tick: res.locals.tick.tick,
        requester_id: res.locals.member.telegram_user.telegram_id
      });
      scanreq = await scanreq.save();
      if(scanreq != null){
        let dscan = await Scan.findOne({planet_id:plnt.planet_id, scantype:3}).sort({tick:-1});
        let dev = null;
        if(dscan != null) {
          dev = await DevelopmentScan.findOne({scan_id:dscan.scan_id});
        }

        let msg = new BotMessage({
          _id:Mordor.Types.ObjectId(),
          message_id: crypto.randomBytes(8).toString("hex"),
          group_id: CFG.groups.scans,
          message: `[${scanreq.id}] ${res.locals.member.panick} ` +
          `requested a ${PA.scantypes[scanreq.scantype]} Scan of ${scanreq.x}:${scanreq.y}:${scanreq.z} ` +
          `Dists(i:${dev != null ? dev.wave_distorter : "?"}/r:${typeof(scanreq.dists) != 'undefined' ? scanreq.dists : "?"})\n` +
          `https://game.planetarion.com/waves.pl?id=${scanreq.scantype}&x=${scanreq.x}&y=${scanreq.y}&z=${scanreq.z}`,
          sent: false
        });
        await msg.save();
      }
    }
  }
  res.redirect('/scans');
});


module.exports = router;

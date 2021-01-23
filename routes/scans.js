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
const Scan = require('../models/scan');
const ScanRequest = require('../models/scan-request');
const PlanetScan = require('../models/scan-planet');
const DevelopmentScan = require('../models/scan-development');
const BotMessage = require('../models/botmessage');
const Planet = require('../models/planet');
const Member = require('../models/member');
const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const access = require('../access');
const url = require("url");
const moment = require('moment-timezone');
const util = require('util');
const crypto = require("crypto");
const bent = require('bent');
const getStream = bent('string');


router.get('/', async (req, res, next) => {
  let scnrs = await Member.find({access:{$gte:1}});
  scnrs = scnrs.filter(s => (s.roles & 2) != 0);
  for(let i = 0; i < scnrs.length; i++) {
    scnrs[i].planet = await Planet.findOne({id:scnrs[i].planet_id});
    scnrs[i].scans = {};
    scnrs[i].scans.d = await Scan.findOne({planet_id:scnrs[i].planet_id, scantype:3}).sort({tick:-1, _id:-1});
    if(scnrs[i].scans.d !== undefined) { scnrs[i].scans.d.scan = await DevelopmentScan.findOne({scan_id:scnrs[i].scans.d.id}); }
    if(scnrs[i].timezone !== undefined) { scnrs[i].currenttime = moment().tz(scnrs[i].timezone).format('LT'); }
  }
  let reqs = await ScanRequest.find({active: true});
  //console.log('SCANTYPES: ' + util.inspect(config.pa.scantypes, false, null, true));
  res.render('scans', { scanners: scnrs, requests: reqs, scantypes:config.pa.scantypes });
});


router.get('/parse', access.webScannerRequired, async (req, res, next) => {
  if(req.query.url == undefined) {
    next(createError(400));
  } else {
    const start_time = Date.now();
    console.log('Sauron Forging The One Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);

    var scanurl = url.parse(req.query.url, true);
    //console.log('SCAN_ID: ' + scanurl.query.scan_id);
    //console.log('SCAN_GRP: ' + scanurl.query.scan_grp);

    let page_content = await getStream(scanurl.href);
    console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);

    if(scanurl.query.scan_id != undefined) {
      //scan
      try {
        let result = await Scan.parse(req.session.member.id, scanurl.query.scan_id, null, page_content);
        //console.log('RESULT: ' + result);
      } catch(err) {
        next(err);
      }
    }

    if(scanurl.query.scan_grp != undefined) {
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


router.post('/parse', access.webScannerRequired, async (req, res, next) => {
  if(req.body.scan_ids !== undefined && req.body.scan_ids.length > 0) {
    const start_time = Date.now();
    console.log('Sauron Forging The One Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);
    //console.log('SESSION: ' + util.inspect(res.locals, false, null, true));

    for(var j = 0; j < req.body.scan_ids.length; j++) {
      if(!await Scan.exists({id:req.body.scan_ids[j]})) {
          let scanurl = url.parse(config.pa.links.scans + '?scan_id=' + req.body.scan_ids[j], true);
          let page_content = await getStream(scanurl.href);
          console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);

          if(scanurl.query.scan_id != undefined) {
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

router.get('/requests', access.webScannerRequired, async (req, res) => {
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
        id: crypto.randomBytes(4).toString("hex"),
        planet_id: plnt.id,
        x: plnt.x,
        y: plnt.y,
        z: plnt.z,
        scantype: req.body.scantype,
        active: true,
        tick: res.locals.tick,
        requester_id: res.locals.member.id
      });
      console.log('SCANREQ: ' + util.inspect(res.locals.tick, false, null, true));
      scanreq = await scanreq.save();
      if(scanreq != null){
        let dscan = await Scan.findOne({planet_id:plnt.id, scantype:3}).sort({tick:-1});
        let dev = null;
        if(dscan != null) {
          dev = await DevelopmentScan.findOne({scan_id:dscan.id});
        }

        let msg = new BotMessage({
          id: crypto.randomBytes(8).toString("hex"),
          group_id: config.groups.scans,
          message: `[${scanreq.id}] ${current_member.panick} ` +
          `requested a ${config.pa.scantypes[scanreq.scantype]} Scan of ${scanreq.x}:${scanreq.y}:${scanreq.z} ` +
          `Dists(i:${dev != null ? dev.wave_distorter : "?"}/r:${typeof(scanreq.dists) != 'undefined' ? scanreq.dists : "?"})\n` +
          `https://game.planetarion.com/waves.pl?id=${scanreq.scantype}&x=${scanreq.x}&y=${scanreq.y}&z=${scanreq.z}`,
          sent: false
        });
        await msg.save();
      }
    }
  }
});

module.exports = router;




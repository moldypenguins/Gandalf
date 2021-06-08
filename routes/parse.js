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
 * @name parse.js
 * @version 2021/06/07
 * @summary Express Route
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const Scan = require('../models/scan');
const BotMessage = require('../models/botmessage');
const Planet = require('../models/planet');
const ScanRequests = require('../models/scan-request');
const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const access = require('../access');
const url = require("url");
const moment = require('moment');
const util = require('util');
const bent = require('bent');
const getStream = bent('string');


router.post('/scans', async (req, res, next) => {
  if(res.locals.member != undefined) {
    if(req.body.scan_ids != undefined && req.body.scan_ids.length > 0) {
      const start_time = Date.now();
      console.log('Sauron Forging The One Ring.');
      console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);
      //console.log('SESSION: ' + util.inspect(res.locals, false, null, true));

      for(var j = 0; j < req.body.scan_ids.length; j++) {
        if(!await Scan.exists({id:req.body.scan_ids[j]})) {
          let scanurl = url.parse(PA.links.scans + '?scan_id=' + req.body.scan_ids[j], true);
          let page_content = await getStream(scanurl.href);
          console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);

          if(scanurl.query.scan_id != undefined) {
            try {
              let result = await Scan.parse(res.locals.member.id, scanurl.query.scan_id, null, page_content);
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
  } else {
    res.sendStatus(401);
  }
});

router.post('/reject', async (req, res, next) => {
  var request_scan_id = req.body.id;
  let request = await ScanRequests.findById(request_scan_id);
  console.log(JSON.stringify(request));
  if (request) {
    request.active = false;
    await request.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(204);
  }
});


module.exports = router;

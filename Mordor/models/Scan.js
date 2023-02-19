'use strict';
/**
 * Gandalf
 * Copyright (c) 2020 Gandalf Planetarion Tools
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
 * @name Scan.js
 * @version 2023/02/04
 * @summary Mongoose Model
 **/

import Config from 'Galadriel/src/galadriel.ts';
import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import {Mordor, Planet, ScanPlanet, ScanDevelopment, ScanUnit, ScanMilitary} from "../mordor.js";
import axios from 'axios';
import url from 'url';
import numeral from 'numeral';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import * as util from "util";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/*
const Planet = require('./Planet');
const ScanRequest = require('./ScanRequest');
const Ship = require('./Ship');
const BotMessage = require('./BotMessage');
const numeral = require('numeral');
const crypto = require("crypto");
*/

let ScanSchema = new mongoose.Schema({
  _id:        {type:mongoose.Schema.Types.ObjectId, required:true},
  scan_id:    {type:String, unique:true, required:true},
  group_id:   {type:String},
  planet:     {type:mongoose.Schema.Types.ObjectId, ref:'Planet', required:true, index:true},
  scantype:   {type:Number, required:true},
  tick:       {type:Number, required:true}
});

ScanSchema.statics.parse = async(link) => {
  let result = false;
  const start_time = Date.now();
  console.log('Sauron Forging The One Ring.');
  console.log(`Start Time: ${dayjs(start_time).format('YYYY-MM-DD H:mm:ss')}`);

  let scanurl = url.parse(link, true);
  //console.log('SCAN_ID: ' + scanurl.query.scan_id);
  //console.log('SCAN_GRP: ' + scanurl.query.scan_grp);
  let page_content;
  try {
    page_content = await axios.get(scanurl.href);
    console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);
  }
  catch(err) {
    console.log(err);
    result = "error";
  }
  if(page_content) {
    //parse
    let m = page_content.match(/>([^>]+) on (\d+)\:(\d+)\:(\d+) in tick (\d+)/i);
    if(m == null) {
      console.log(`Expired/non-matchinng scan (id: ${scan_id})`);
    } else {
      let _scantype = Object.keys(Config.pa).find(key => Config.pa.scans[key].name.toUpperCase() === m[1].toUpperCase());

      console.log(`SCANTYPE: ${util.inspect(_scantype, true, null, true)}`)

      let _x = numeral(m[2]).value();
      let _y = numeral(m[3]).value();
      let _z = numeral(m[4]).value();
      let _tick = numeral(m[5]).value();
      let _planet = await Planet.findOne({x:_x, y:_y, z:_z});
      if(_planet == null) {
        console.log(`Unable to find planet ${_x}:${_y}:${_z}`);
      } else {
        try {
          let scn = new Scan({
            _id: Mordor.Types.ObjectId(),
            scan_id: scan_id,
            group_id: group_id,
            planet: planet,
            scantype: scan_type,
            tick: tick
          });
          let saved = await scn.save();


          console.log(`Parsed scan(s) in: ${Date.now() - start_time}ms`);
          result = true
        }
        catch(err) {
          console.log('Error in scans parsing: ' + err);
        }
      }
    }
  }
  return result;
};


export default mongoose.model('Scan', ScanSchema, 'Scans');

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

import Config from 'galadriel';
import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import {Mordor, ScanPlanet, ScanDevelopment, ScanUnit, ScanMilitary} from "../mordor.js";
import axios from 'axios';
import url from 'url';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
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



    console.log(`Parsed scan(s) in: ${Date.now() - start_time}ms`);
    result = true
  }
  return result;
};


export default mongoose.model('Scan', ScanSchema, 'Scans');

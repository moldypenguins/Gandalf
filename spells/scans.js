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
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const FNCS = require('../Functions');

const Scan = require('../models/Scan');
const ScanRequest = require('../models/ScanRequest');
const DevelopmentScan = require('../models/ScanDevelopment');
const Planet = require('../models/Planet');
const Member = require('../models/Member');
const Tick = require('../models/Tick');
const BotMessage = require('../models/BotMessage');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const crypto = require('crypto');


var Scans_req_usage = he.encode('!req <x:y:z> <p|d|n|j|a>');
var Scans_req_desc = 'Request a scan.';
var Scans_req = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 2) { reject(Scans_req_usage); }
    var coords = args[0];
    var scan_types = args[1];
    Tick.findOne().sort({ id: -1 }).then(async (last_tick) => {
      FNCS.coordsToPlanetLookup(coords).then(async (planet) => {
        if (planet) {
          let reply = `Scan request for <b>${planet.x}:${planet.y}:${planet.z}</b> has been submitted for:\n`;
          for (let type of scan_types) {
            console.log(type);
            var number_type = Object.keys(PA.scantypes).find(key => PA.scantypes[key].charAt(0).toUpperCase() === type.toUpperCase());
            console.log(number_type);
            let scanreq = new ScanRequest({ id:crypto.randomBytes(4).toString("hex"), planet_id: planet.id, x: planet.x, y: planet.y, z: planet.z, scantype: number_type, active: true, tick: last_tick.id, requester_id: current_member.id });
            scanreq = await scanreq.save();
            
            var dscan = await Scan.findOne({planet_id:planet.id,scantype:3}).sort({tick:-1});
            var dev = null;
            if(dscan != null) {
              dev = await DevelopmentScan.findOne({scan_id:dscan.id});
            }
            //######################################################################################
            let txt = `[${scanreq.id}] ${current_member.panick} ` + 
              `requested a ${PA.scantypes[scanreq.scantype]} Scan of ${scanreq.x}:${scanreq.y}:${scanreq.z} ` +
              `Dists(i:${dev != null ? dev.wave_distorter : "?"}/r:${typeof(scanreq.dists) != 'undefined' ? scanreq.dists : "?"})\n` + 
              `https://game.planetarion.com/waves.pl?id=${scanreq.scantype}&x=${scanreq.x}&y=${scanreq.y}&z=${scanreq.z}`;

            let msg = new BotMessage({ id:crypto.randomBytes(8).toString("hex"), group_id: CFG.groups.scans,
              message: txt, 
              sent: false 
            });

            let msgsaved = await msg.save();
            console.log(`Sent Message: "${msgsaved.message}"`);
            //######################################################################################
            
            reply += `${PA.scantypes[number_type].charAt(0).toUpperCase()}:${scanreq.id}\n`;
          }
          resolve(reply);
        } else {
          resolve(`Sorry I don't know who ${coords} is.`);
        }
      }).catch(async (error) => {
        resolve(`Error: ${error}`);
      });
    });
  });
};


var Scans_findscan_usage = he.encode('!findscan <x:y:z> <p|d|n|j|a>');
var Scans_findscan_desc = 'Find recent scans for a planet.';
var Scans_findscan = (args) => {
  return new Promise(async (resolve, reject)  => {
    if (!Array.isArray(args) || args.length < 2) { reject(Scans_scan_usage); }
    let coords = args[0];
    let scan_types = args[1];
    let planet = await FNCS.coordsToPlanetLookup(coords);
    if (!planet) {
      reject(`Planet not found!`);
      return;
    }
    let reply = `Found scans for ${planet.x}:${planet.y}:${planet.z}:\n`
    for (let type of scan_types) {
      let scan_type = Object.keys(PA.scantypes).find(key => PA.scantypes[key].charAt(0).toUpperCase() === type.toUpperCase());
      reply += `${type.toUpperCase()}:\n`
      let scans = await Scan.find({planet_id: planet.id, scantype: scan_type}).sort({tick: -1}).limit(3);
      if (scans && scans.length > 0) {
        for (let scan of scans) {
          reply += `${PA.links.scans}?scan_id=${scan.id}\n`
        }
      } else {
        reply += `<i>None found</i>\n`
      }
      reply += `\n`;
    }
    resolve(reply);
  });
};

var Scans_reqcancel_usage = he.encode('!reqcancel <id>');
var Scans_reqcancel_desc = 'Cancel a scan request given the id';
var Scans_reqcancel = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Scans_reqcancel_usage); }
    let id = args[0];
    let reply = ``;
    let request = await ScanRequest.findOne({id:id,requester_id:current_member.id,active:true});
    if (!request) {
      reply = `You don't have any scan requests by that id that are still active.`;
    } else {
      request.active = false;
      await request.save();
      reply = `Scan request ${id} has been removed.`;
    }
    resolve(reply);
  });
};

let Scans_reqlinks_usage = he.encode('!reqlinks');
let Scans_reqlinks_desc = 'Shows a list of scan requests';
let Scans_reqlinks = (args) => {
  return new Promise(async (resolve, reject) => {
    let requests = await ScanRequest.find({active:true});
    let msg = '';
    for(let req in requests) {
      msg += `[${requests[req].id}] https://game.planetarion.com/waves.pl?id=${requests[req].scantype}&x=${requests[req].x}&y=${requests[req].y}&z=${requests[req].z}\n`;
    }
    resolve(msg);
  });
};

module.exports = {
  "reqscan": { usage: Scans_req_usage, description: Scans_req_desc, cast: Scans_req, include_member: true },
  "findscan": { usage: Scans_findscan_usage, description: Scans_findscan_desc, cast: Scans_findscan },
  "reqcancel": { usage: Scans_reqcancel_usage, description: Scans_reqcancel_desc, cast: Scans_reqcancel, include_member: true },
  "reqlinks" : { usage: Scans_reqlinks_usage, description: Scans_reqlinks_desc, access: AXS.botScannerRequired, channel: AXS.botChannelScannerPrivate, cast: Scans_reqlinks }
};


const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const Utils = require('../../utils');
const ScanRequest = require('../../models/scan-request');
const Planet = require('../../models/planet');
const Member = require('../../models/member');
const Tick = require('../../models/tick');
const BotMessage = require('../../models/botmessage');
const crypto = require("crypto");


var Scans_req_usage = entities.encode('!req <x:y:z> <p|d|n|j|a>');
var Scans_req_desc = 'Request a scan.';
var Scans_req = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 2) { reject(Scans_req_usage); }
    var coords = args[0];
    var scan_types = args[1];
    Tick.findOne().sort({ id: -1 }).then(async (last_tick) => {
      Utils.coordsToPlanetLookup(coords).then(async (planet) => {
        if (planet) {
          let reply = `Scan request for <b>${planet.x}:${planet.y}:${planet.z}</b> has been submitted for:\n`;
          for (let type of scan_types) {
            console.log(type);
            var number_type = Object.keys(config.pa.scantypes).find(key => config.pa.scantypes[key].charAt(0).toUpperCase() === type.toUpperCase());
            console.log(number_type);
            let scanreq = new ScanRequest({ id:crypto.randomBytes(4).toString("hex"), planet_id: planet.id, x: planet.x, y: planet.y, z: planet.z, scantype: number_type, active: true, tick: last_tick.id, requester_id: current_member.id });
            scanreq = await scanreq.save();

            //######################################################################################
            let txt = `[${scanreq.id}] ${current_member.panick} requested a ${config.pa.scantypes[scanreq.scantype]} Scan of ${scanreq.x}:${scanreq.y}:${scanreq.z} Dists(i:intel/r:${typeof(scanreq.dists) != 'undefined' ? scanreq.dists : "?"})`;

            let msg = new BotMessage({ id:crypto.randomBytes(8).toString("hex"), group_id: config.groups.scans, 
              message: txt, 
              sent: false 
            });

            let msgsaved = await msg.save();
            console.log(`Sent Message: "${msgsaved.message}"`);
            //######################################################################################
            
            reply += `${config.pa.scantypes[number_type].charAt(0).toUpperCase()}:${scanreq.id}\n`;
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


var Scans_scan_usage = entities.encode('!scan <x:y:z> [p|d|n|j|a]');
var Scans_scan_desc = 'Show recent scans for a planet.';
var Scans_scan = (args) => {
  return new Promise(function (resolve, reject) {
    resolve('Coming Soon');
  });
};

var Scans_cancel_usage = entities.encode('!cancel <id>');
var Scans_cancel_desc = 'Cancel a scan request given the id';
var Scans_cancel = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Scans_cancel_usage); }
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


module.exports = {
  "req": { usage: Scans_req_usage, description: Scans_req_desc, cast: Scans_req, include_member: true },
  "scan": { usage: Scans_scan_usage, description: Scans_scan_desc, cast: Scans_scan },
  "cancel": { usage: Scans_cancel_usage, description: Scans_cancel_desc, cast: Scans_cancel, include_member: true },
};


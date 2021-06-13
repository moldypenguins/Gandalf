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
 * @name Member.js
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const Mordor = require('../Mordor');

const Planet = require('./Planet');
const PlanetScan = require('./ScanPlanet');
const DevelopmentScan = require('./ScanDevelopment');
const UnitScan = require('./ScanUnit');
const ScanRequest = require('./ScanRequest');
const Ship = require('./Ship');
const BotMessage = require('./BotMessage');

const numeral = require('numeral');
const crypto = require("crypto");

let ScanSchema = new Mordor.Schema({
  _id:      {type:Mordor.Schema.Types.ObjectId, required:true},
  scan_id:  {type:String, unique:true, required:true},
  group_id: {type:String},
  planet:   {type:Mordor.Schema.Types.ObjectId, reference:'Planet', required:true, index:true},
  scantype: {type:Number, required:true},
  tick:     {type:Number, required:true},
  scanner:  {type:Number, required:true}
});


ScanSchema.statics.parse = async (member_id, scan_id, group_id, page_content) => {
  var rslt = null;
  var m = page_content.match(/>([^>]+) on (\d+)\:(\d+)\:(\d+) in tick (\d+)/i);
  if(m == null) {
    console.log(`Expired/non-matchinng scan (id: ${scan_id})`);
  } else {
    let scan_type = Object.keys(PA.scantypes).find(key => PA.scantypes[key].charAt(0).toUpperCase() === m[1].charAt(0).toUpperCase()) * 1;
    let x = numeral(m[2]).value();
    let y = numeral(m[3]).value();
    let z = numeral(m[4]).value();
    let tick = numeral(m[5]).value();
    let planet = await Planet.findOne({x:x, y:y, z:z});
    if(planet == null) {
      console.log(`Unable to find planet ${x}:${y}:${z}`);
    } else {
      //console.log('SCANTYPE: ' + util.inspect(scantype, false, null, true));
      try {
        let scn = new Scan({
          id:scan_id,
          group_id:group_id,
          planet_id:planet.id,
          scantype:scan_type,
          tick:tick,
          scanner_id:member_id
        });
        let saved = await scn.save();
        if(saved != undefined) {
          console.log(`SCANTYPE: ${scan_type} (${typeof(scan_type)})`);
          switch(scan_type) {
            case 1:
              let pscan = new PlanetScan({scan_id:saved.id});
              var m = page_content.match(/<tr><td[^>]*>Metal<\/td><td[^>]*>([,\d]+)<\/td><td[^>]*>([,\d]+)<\/td><\/tr>/i);
              pscan.roid_metal = m[1].replace(/,/g, '');
              pscan.res_metal = m[2].replace(/,/g, '');
              var c = page_content.match(/<tr><td[^>]*>Crystal<\/td><td[^>]*>([,\d]+)<\/td><td[^>]*>([,\d]+)<\/td><\/tr>/i);
              pscan.roid_crystal = c[1].replace(/,/g, '');
              pscan.res_crystal = c[2].replace(/,/g, '');
              var e = page_content.match(/<tr><td[^>]*>Eonium<\/td><td[^>]*>([,\d]+)<\/td><td[^>]*>([,\d]+)<\/td><\/tr>/i);
              pscan.roid_eonium = e[1].replace(/,/g, '');
              pscan.res_eonium = e[2].replace(/,/g, '');
              //var sv = page_content.match(/<tr><th[^>]*>Value<\/th><th[^>]*>Score<\/th><\/tr>\n\t<tr><td[^>]*>([,\d]+)<\/td><td[^>]*>([,\d]+)<\/td><\/tr>/i);
              var ag = page_content.match(/<tr><th[^>]*>Agents<\/th><th[^>]*>Security\s+Guards<\/th><\/tr>\n\t<tr><td[^>]*>([,\d]+)<\/td><td[^>]*>([,\d]+)<\/td><\/tr>/i);
              pscan.agents = ag[1].replace(/,/g, '');
              pscan.guards = ag[2].replace(/,/g, '');
              var fac = page_content.match(/<tr><th[^>]*>Light<\/th><th[^>]*>Medium<\/th><th[^>]*>Heavy<\/th><\/tr>\n\t<tr><td[^>]*>([^<]+)<\/td><td[^>]*>([^<]+)<\/td><td[^>]*>([^<]+)<\/td><\/tr>/i);
              pscan.factory_usage_light = fac[1];
              pscan.factory_usage_medium = fac[2];
              pscan.factory_usage_heavy = fac[3];
              var pr = page_content.match(/Total Amount of Resources in Production: <span[^>]*>([,\d]+)<\/span>/i);
              pscan.prod_res = pr[1].replace(/,/g, '');
              var ssr = page_content.match(/Total Amount of Resources From Ships Being Sold: <span[^>]*>([,\d]+)<\/span>/i);
              pscan.ships_sold_res = ssr[1].replace(/,/g, '');
              //console.log('PLANETSCAN: ' + util.inspect(pscan, false, null, true));
              await pscan.save();
              break;
            case 3:
              let dscan = new DevelopmentScan({scan_id:saved.id});
              var cons = page_content.match(/<tr><td[^>]*>Light\s+Factory<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Medium\s+Factory<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Heavy\s+Factory<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Wave\s+Amplifier<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Wave\s+Distorter<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Metal\s+Refinery<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Crystal\s+Refinery<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Eonium\s+Refinery<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Research\s+Laboratory<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Finance\s+Centre<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Military\s+Centre<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Security\s+Centre<\/td><td[^>]*>([,\d]*)<\/td><\/tr>\n\t<tr><td[^>]*>Structure\s+Defence<\/td><td[^>]*>([,\d]*)<\/td><\/tr>/i);
              dscan.light_factory = cons[1];
              dscan.medium_factory = cons[2];
              dscan.heavy_factory = cons[3];
              dscan.wave_amplifier = cons[4];
              dscan.wave_distorter = cons[5];
              dscan.metal_refinery = cons[6];
              dscan.crystal_refinery = cons[7];
              dscan.eonium_refinery = cons[8];
              dscan.research_lab = cons[9];
              dscan.finance_centre = cons[10];
              dscan.military_centre = cons[11];
              dscan.security_centre = cons[12];
              dscan.structure_defence = cons[13];
              var res = page_content.match(/<tr><td[^>]*>Space\s+Travel<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Infrastructure<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Hulls<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Waves<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Core\s+Extraction<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Covert\s+Ops<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Asteroid\s+Mining<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>\n\t<tr><td[^>]*>Population\s+Management<\/td><td[^>]*>([,\d]+).+<\/td><\/tr>/i);
              dscan.travel = res[1];
              dscan.infrastructure = res[2];
              dscan.hulls = res[3];
              dscan.waves = res[4];
              dscan.core = res[5];
              dscan.covert_op = res[6];
              dscan.mining = res[7];
              dscan.population = res[8];
              await dscan.save();
              break;
            case 4:
            case 8:
              console.log(`SCANTYPE: Advanced Unit`);
              let matches = page_content.match(/([\w\s]+)<\/td><td[^>]*>([,\d]+)<\/td>/gi);
              if (matches) {
                for(let i = 0; i < matches.length; i++) {
                  let match = matches[i].match(/([\w\s]+)<\/td><td[^>]*>([,\d]+)<\/td>/i);
                  if(match) {
                    var ship = await Ship.findOne({name:match[1]});
                    if(ship != undefined) {
                      
                      var uscan = new UnitScan({scan_id:saved.id, ship_id:ship.id, amount:match[2].replace(',','')});
                      var svd = await uscan.save();
                      //console.log("SAVED: " + util.inspect(svd,false,null,true));
                    }
                  }
                }
              }
              break;
          }
          rslt = saved;
          
          // check if any outstanding scan requests for this!!
          let requests = await ScanRequest.find({active:true,planet_id:saved.planet_id, scantype: saved.scantype});
          if (requests && requests.length > 0) {
            console.log(`found a good request`);
            for(var request of requests) {
              console.log(`iterating over requests: ${JSON.stringify(request)}`);
              // find the planet and send the message to whoever requested it
              let planet = await Planet.findOne({id: request.planet_id});
              if (planet && planet.id) {
                console.log(`found planet for scan request ${planet.x}:${planet.y}:${planet.z}`);
                let text = `Your ${PA.scantypes[saved.scantype]} request for ${planet.x}:${planet.y}:${planet.z} has been fullfilled: https://game.planetarion.com/showscan.pl?scan_id=${saved.id}`;
                console.log(`sending text: ${text}`);
                let msg = new BotMessage({id:crypto.randomBytes(8).toString("hex"), group_id: request.requester_id, message: text, sent: false});
                await msg.save();
                // turn it off
                request.active = false;
                console.log(`set request to false`);
                await request.save();
                console.log(`saved.`);
              }
            }
          }
          
        }
      } catch (err) {
        console.log('Error in scans parsing: ' + err);
      }
    }

  }
  return rslt;
}

let Scan = Mordor.model('Scan', ScanSchema, 'Scans');

module.exports = Scan;

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
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require('util');
const Attack = require('../models/attack');
const AttackTargetClaims = require('../models/attack-target-claim');
const DevelopmentScan = require('../models/scan-development')
const Planet = require('../models/planet');
const Tick = require('../models/tick');


let Attacks_claims_usage = he.encode('!claims [attack number]');
let Attacks_claims_desc = 'List your claims.';
let Attacks_claims = (args, ctx) => {
  return new Promise(async (resolve, reject)  => {
    let attackid = args[0] || null;

    let lasttick = await Tick.findOne().sort({id:-1});

    let attack = null;
    if(attackid != null) {
      attack = await Attack.findOne({id:attackid, releasetick:{$lte:lasttick.id}});
    } else {
      attack = await Attack.findOne({releasetick:{$lte:lasttick.id}, $where:`this.landtick + this.waves > ${lasttick.id}`}).sort({id:-1});
    }
    //console.log('ATTACK:' + util.inspect(attack, false, null, true));

    if(attack == null) {
      reject('No attack found.');
    } else {
      let reply = `<b>Attack ${attack.id}:</b>\n`;
      let claims = await AttackTargetClaims.find({member_id: ctx.message.from.id, attack_id: attack.id}).sort({wave: 1});
      console.log('CLAIMS:' + util.inspect(claims, false, null, true));
      if (claims == null || claims.length <= 0) {
        reply = `No claims found.`;
      } else {
        let groupedClaims = claims.reduce((hash, obj) => {
          if(obj.wave === undefined) return hash;
          return Object.assign(hash, { [obj.wave]:( hash[obj.wave] || [] ).concat(obj)})
        }, {});
        console.log('GROUPED:' + util.inspect(groupedClaims, false, null, true));
        for (let n = 0; n < groupedClaims.length; n++) {
          let planet = await Planet.findOne({id: groupedClaims[n].planet_id});
          let dscan = await DevelopmentScan.findOne({planet_id: groupedClaims[n].planet_id});
          reply += `${planet.x}:${planet.y}:${planet.z} LT${groupedClaims[n].wave + attack.landtick} (A: ${dscan == null ? '?' : dscan.wave_amplifier} | D: ${dscan == null ? '?' : dscan.wave_distorter})\n`;
        }
      }
      resolve(reply);
    }
  });
};


module.exports = {
  "claims": {usage: Attacks_claims_usage, description: Attacks_claims_desc, cast: Attacks_claims, include_ctx: true},
}
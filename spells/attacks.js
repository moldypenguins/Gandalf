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
const Planet = require('../models/planet');


let Attacks_claims_usage = he.encode('!claims [attack number]');
let Attacks_claims_desc = 'List your claims.';
let Attacks_claims = (args, ctx) => {
  return new Promise(async (resolve, reject)  => {
    let attackid = args[0] || null;
    let attack = null;
    if(attackid != null) {
      attack = await Attack.findOne({id:attackid});
    } else {
      attack = await Attack.findOne().sort({id:-1});
    }

    console.log('ATTACK:' + util.inspect(attack, false, null, true));

    if(attack == null) {
      reject('Attack not found.');
    } else {
      let reply = ``;
      let claims = await AttackTargetClaims.find({member_id: ctx.message.from.id, id: attackid});

      //console.log('CLAIMS:' + util.inspect(claims, false, null, true));

      if (claims == null) {
        reply = `No claims found.`;
      } else {
        for (let claim of claims) {
          let planet = await Planet.findOne({id: claim.planet_id});
          reply += `${planet.x}:${planet.y}:${planet.z} LT${claim.wave + attack.landtick} (A:?|D:?)\n`;
        }
      }
      resolve(reply);
    }
  });
};


module.exports = {
  "claims": {usage: Attacks_claims_usage, description: Attacks_claims_desc, cast: Attacks_claims, include_ctx: true},
}
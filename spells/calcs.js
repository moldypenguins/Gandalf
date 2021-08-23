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
 * @name calcs.js
 * @version 2021/06/07
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const FNCS = require('../Functions');

const Tick = require('../models/Tick');
const Galaxy = require('../models/Galaxy');
const Planet = require('../models/Planet');

const numeral = require('numeral');
//const moment = require('moment');
const moment = require('moment-timezone');
const he = require('he');
const util = require('util');

let Calcs_exile_usage = he.encode('!exile');
let Calcs_exile_desc = 'Shows information regarding chances of landing in desired galaxies.';
let Calcs_exile = (args) => {
  return new Promise(async(resolve, reject) => {
    let galaxy_count = await Galaxy.countDocuments({active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}]});
    console.log(`galaxy_count: ${galaxy_count}`);

    let galaxy_limit = Math.trunc(galaxy_count * 0.2);
    console.log(`galaxy_limit: ${galaxy_limit}`);

    let galaxy_groups = await Galaxy.aggregate([
      {$match: {active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}]}},
      {$sort: {planets: 1}},
      {$limit: galaxy_limit},
      {$group: {_id: '$planets', galaxies: {$sum: 1}}}
    ]).sort({_id: 1});
    console.log('GALAXY_GROUPS: ' + util.inspect(galaxy_groups.length, false, null, true));


    let max_planet_gal_count = await Galaxy.countDocuments({active: true, planets: {$eq: galaxy_groups[galaxy_groups.length - 1]._id}});

    let message = `Exile Bracket: ${galaxy_limit} of ${galaxy_count} galaxies.`;
    for(let g in galaxy_groups) {
      if(g < galaxy_groups.length - 1) {
        message += `\n${galaxy_groups[g].galaxies}` + galaxy_groups[g].galaxies > 1 ? 'galaxies' : 'galaxy' + ` with ${galaxy_groups[g]._id} planets`;
      } else {
        message += `\n${galaxy_groups[g].galaxies} out of ${max_planet_gal_count} galaxies with ${galaxy_groups[g]._id} planets`;
      }
      console.log('GALAXY_GROUP: ' + util.inspect(galaxy_groups[g], false, null, true));
    }


    resolve(message);
    //resolve(`Total galaxies: ${gals} | ${base_bracket_gals} galaxies with a maximum of ${max_planets} planets guaranteed to be in the exile bracket`);
  });
};

var Calcs_bonusmining_usage = he.encode('!bonusmining [tick=NOW] [bonus=0]');
var Calcs_bonusmining_desc = 'Calculates how many ticks you need to keep the bonus roids to be worth it vs accepting resources';
var Calcs_bonusmining = (args) => {
  return new Promise(async (resolve, reject) => {
    let tick = null;
    if (Array.isArray(args) && args.length > 0) {
      tick = numeral(args[0]).value();
    }
    let bonus = 1.0 + (args.length == 2 ? (numeral(args[1]).value() / 100) : 0);
    Tick.findOne().sort({ id: -1 }).then((last_tick) => {
      tick = tick == null ? last_tick.id : tick;

      let resource_bonus = 10000 + (tick * 4800);
      let roids = Math.trunc(6 + (tick * 0.15));
      let mining = PA.roids.mining;
      let mining_bonus = mining * ((bonus + 100) / 100);
      let reply = `Resource Bonus at tick ${tick}: <b>${resource_bonus}</b>\nRoid bonus at tick ${tick}: <b>${roids}</b>\nMining Bonus: <b>${mining_bonus}</b>\n`;
      let ticks = resource_bonus / (roids * mining_bonus);
      reply += `Would take <b>${Math.ceil(ticks)}</b>  ticks (${Math.trunc(ticks / 24)} days) to produce <b>${resource_bonus}</b> of each mineral`
      resolve(reply);
    });
  });
};

var Calcs_bonus_usage = he.encode('!bonus [tick=NOW] [bonus=0]');
var Calcs_bonus_desc = 'Calculates the bonus for a given tick (bonus argument is provided by PA bonus screen 3% etc.)';
var Calcs_bonus = (args) => {
  return new Promise(async (resolve, reject) => {
    let tick = null;
    let bonus = 0;
    if (Array.isArray(args) && args.length > 0) {
      tick = numeral(args[0]).value();
    }
    bonus = 1.0 + (args.length == 2 ? (numeral(args[1]).value() / 100) : 0);
    Tick.findOne().sort({ id: -1 }).then((last_tick) => {
      tick = tick == null ? last_tick.id : tick;
      
      let resource_bonus = 10000 + (tick * 4800);
      let roid_bonus = Math.trunc(6 + (tick * 0.15));
      let rp_bonus = Math.trunc((4000 + (tick * 24) * bonus));
      let cp_bonus = Math.trunc((2000 + (tick * 18) * bonus));
      resolve(`Upgrade Bonus calculation for tick: ${tick}\nResource Bonus: ${resource_bonus}\nRoid Bonus: ${roid_bonus}\nResearch Point Bonus: ${rp_bonus}\nConstruction Point Bonus: ${cp_bonus}`);
    });
  });
};

var Calcs_roidcost_usage = he.encode('!roidcost <roids> <value_cost> [mining_bonus]');
var Calcs_roidcost_desc = 'Calculate how long it will take to repay a value loss capping roids.';
var Calcs_roidcost = (args) => {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(args) || args.length < 1) reject(Calcs_roidcost_usage);
    let roids = numeral(args[0]).value();
    let cost = numeral(args[1]).value();
    let bonus = args.length === 3 ? numeral(args[2]).value() : numeral(0).value();
    let mining = PA.roids.mining;
    mining = mining * ((bonus + 100) / 100);
    console.log(`roids: ${roids}`);
    console.log(`cost: ${cost}`);
    console.log(`bonus: ${bonus}`);
    console.log(`mining: ${mining}`);
    let ticks = (cost * PA.numbers.ship_value) / (roids * mining);
    console.log(`ticks: ${ticks}`);
    let reply = `Capping <b>${roids}</b> roids at <b>${cost}</b> value with <b>${bonus}</b> bonus will repay in <b>${ticks}</b> ticks (${Math.trunc(ticks / 24)} days)`;
    for (let gov in PA.governments) {
      bonus = PA.governments[gov].prodcost;
      if (bonus === 0) continue;
      let ticks_b = ticks * (1 + bonus);
      reply += ` <b>${PA.governments[gov].name}</b>: <b>${ticks_b}</b> ticks (${Math.trunc(ticks_b/24)} days)`
    }

    resolve(reply);
  });
};

var Calcs_tick_usage = he.encode('!tick [tick=NOW] [timezone=GMT]');
var Calcs_tick_desc = 'Calculate when a tick will occur.';
var Calcs_tick = (args) => {
  return new Promise(async (resolve, reject) => {
    let now = await Tick.findOne().sort({ tick: -1 });
    let tick = numeral(args.length > 0 ? args[0] : now.tick).value()
    if (tick == null) reject(`tick provided must be a number`);
    let timezone = args.length > 1 ? args[1] : "GMT";
    if (moment.tz.zone(timezone) == null) reject(`invalid timezone: ${timezone}`);

    let dt = moment(now.timestamp);
    let diff = tick - now.tick;
    if (tick === now.tick) diff = 0; //why this line?
    dt = dt.add(diff, 'hours');
    dt = dt.tz(timezone);

    let reply;
    if (diff === 0) {
      reply = `It is currently tick ${now.tick} (${dt.format('ddd')} ${dt.format('D')}/${dt.format('MM')} ${dt.format('HH')}:${dt.format('mm')} <i>${timezone.toUpperCase()}</i>)`;
    } else {
      reply = `Tick <b>${tick}</b> is expected to happen in ${diff} ticks (${dt.format('ddd')} ${dt.format('D')}/${dt.format('MM')} ${dt.format('HH')}:00 <i>${timezone.toUpperCase()}</i>)`;
    }
    resolve(reply);
  });
};



var Calcs_refsvsfcs_usage = he.encode('!refsvsfcs <roids> <metal ref #> <crystal ref #> <eonium ref #> <FC #> <gov> <mining population> <cores>');
var Calcs_refsvsfcs_desc = 'Calculates if you should be building refs or fcs based on inputs';
var Calcs_refsvsfcs = (args) =>{
  return new Promise(async (resolve, reject) => {
    if (args.length < 8) {
      reject(Calcs_refsvsfcs_usage);
      return;
    }
    let roids = numeral(args[0]).value();
    let metal_ref = numeral(args[1]).value();
    let crystal_ref = numeral(args[2]).value();
    let eon_ref = numeral(args[3]).value();
    let fc = numeral(args[4]).value();
    let gov_bonus = 0; // args[5]
    let population = numeral(args[6]).value() / 100;
    let cores = numeral(args[7]).value();
    let goverments = PA.governments;
    for (var gov in goverments) {
      let goverment = goverments[gov];
      console.log(`goverment ${JSON.stringify(goverment)}`);
      if (goverment.name.toLowerCase().startsWith(args[5].toLowerCase()) || goverment.name.toLowerCase().includes(args[5])) {
        gov_bonus = goverment.mining;
        console.log(`found ${gov_bonus}`)
      }
    }

    console.log(`gov bonus: ${gov_bonus}`);

    let now = await Tick.findOne().sort({ id: -1 }); 
    console.log(`now.tick ${now.tick}`);
    let ticksLeft = 1157 - now.tick;//numeral(PA.tick.end).value() - numeral(now.tick).value();
    console.log(`ticks left ${ticksLeft}`);

    // Assume they will build the cheapest refinery next. This is always the most efficient thing to do for maxing income anyway.
    let lowestRef = Math.min(metal_ref, crystal_ref, eon_ref); 
    let baseRefCost = PA.construction.baseRefCost;
    let baseFCCost = PA.construction.baseFCCost;
    let fcBonus = PA.construction.fcBonus;
    let roidIncome = PA.roids.mining;
    let refIncome = PA.construction.refIncome;

    // Calculate stats requied for comparison
    // "base cost of each resource * (((# of this type of structure + 1)^1.25)/1000 + 1) * (# of this type of structure + 1)"
    var nextRefCost = Math.floor(baseRefCost * ((Math.pow((lowestRef + 1), 1.25) / 1000 + 1)) * (lowestRef + 1));
    console.log(`nextRefCost: ${nextRefCost}`);
    var nextFCCost = Math.floor(baseFCCost * ((Math.pow((fc + 1), 1.25) / 1000 + 1)) * (fc + 1));
    console.log(`nextFCCost: ${nextFCCost}`);
    var totalMiningBonus = gov_bonus + population + (fc * fcBonus);
    console.log(`totalMiningBonus: ${totalMiningBonus}`);
    var roidMining = roids * roidIncome;
    console.log(`roidMining: ${roidMining}`);
    var coreRefIncome = ((metal_ref + crystal_ref + eon_ref) * refIncome) + (coresIncValue(cores) * 3);
    console.log(`coreRefIncome: ${coreRefIncome}`);
    var totalIncome = Math.floor((roidMining + coreRefIncome) * (1 + totalMiningBonus));
    console.log(`totalIncome: ${totalIncome}`);

    // Calculate the income that can be generated by adding a refinery
    var extraRefIncome = refIncome * (1 + totalMiningBonus);
    console.log(`extraRefIncome: ${extraRefIncome}`);
    var extraFCIncome = Math.floor(((roidMining + coreRefIncome) * (1 + (totalMiningBonus + fcBonus))) - totalIncome);
    console.log(`extraFCIncome: ${extraFCIncome}`);
    var eorRefGen = (extraRefIncome * ticksLeft) - nextRefCost;
    console.log(`eorRefGen: ${eorRefGen}`);
    var eorFCGen = (extraFCIncome * ticksLeft) - nextFCCost;
    console.log(`eorFCGen: ${eorFCGen}`);

    // Get the value of potential extra resources per construction unit
    var eorRefGenCU = Math.round(eorRefGen / PA.construction.refCU);
    var eorFCGenCU = Math.round(eorFCGen / PA.construction.fcCU);

    // return results
    if (eorRefGenCU >= eorFCGenCU) {
      resolve(`<b>Build Refineries</b>\nFor every CU spent on FC you will generate <b>${eorFCGenCU}</b> resources by EOR.\nFor every CU spent on Refineries you will generate <b>${eorRefGenCU}</b> resources by EOR.`);
    } else {
      resolve(`<b>Build Finance Centres</b>\nFor every CU spent on FC you will generate <b>${eorFCGenCU}</b> resources by EOR.\nFor every CU spent on Refineries you will generate <b>${eorRefGenCU}</b> resources by EOR.`);
    }
  })
};


function coresIncValue(cores) {
  if (cores == 0) {
    return 1000
  } else if (cores == 1) {
    return 3500
  } else if (cores == 2) {
    return 7000
  } else if (cores == 3) {
    return 12500
  } else {
    return 20000
  }
}

module.exports = {
  "exile": { usage: Calcs_exile_usage, description: Calcs_exile_desc, cast: Calcs_exile },
  "roidcost": { usage: Calcs_roidcost_usage, description: Calcs_roidcost_desc, cast: Calcs_roidcost },
  "tick": { usage: Calcs_tick_usage, description: Calcs_tick_desc, cast: Calcs_tick },
  "bonus": { usage: Calcs_bonus_usage, description: Calcs_bonus_desc, cast: Calcs_bonus },
  "bonusmining": { usage: Calcs_bonusmining_usage, description: Calcs_bonusmining_desc, cast: Calcs_bonusmining },
  "refsvsfcs": { usage: Calcs_refsvsfcs_usage, description: Calcs_refsvsfcs_desc, cast: Calcs_refsvsfcs },
};

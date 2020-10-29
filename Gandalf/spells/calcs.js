const config = require('../../config');
const numeral = require('numeral');
const moment = require('moment-timezone');
const qs = require("querystring");
const Tick = require('../../models/tick');
const Members = require('../../models/member');
const Planets = require('../../models/planet');
const Utils = require('../../utils');

var Calcs_exile_usage = qs.encode('!exile');
var Calcs_exile_desc = 'Shows information regarding chances of landing in desired galaxies.';
var Calcs_exile = (args) => {
  return new Promise(function (resolve, reject) {
    resolve('Coming Soon');
  });
};

var Calcs_bonusmining_usage = qs.encode('!bonusmining <tick=NOW> <bonus=0>');
var Calcs_bonusmining_desc = 'Calculates how many ticks you need to keep the bonus roids to be worth it vs accepting resources';
var Calcs_bonusmining = (args) => {
  return new Promise(async (resolve, reject) => {
    let tick = null;
    if (Array.isArray(args) && args.length > 0) {
      tick = numeral(args[0]).value();
    }
    bonus = 1.0 + (args.length == 2 ? (numeral(args[1]).value() / 100) : 0);
    Tick.findOne().sort({ id: -1 }).then((last_tick) => {
      tick = tick == null ? last_tick.id : tick;

      let resource_bonus = 10000 + (tick * 4800);
      let roids = Math.trunc(6 + (tick * 0.15));
      let mining = config.pa.roids.mining;
      let mining_bonus = mining * ((bonus + 100) / 100);
      let reply = `Resource Bonus at tick ${tick}: <b>${resource_bonus}</b>\nRoid bonus at tick ${tick}: <b>${roids}</b>\nMining Bonus: <b>${mining_bonus}</b>\n`;
      let ticks = resource_bonus / (roids * mining_bonus);
      reply += `Would take <b>${Math.ceil(ticks)}</b>  ticks (${Math.trunc(ticks / 24)} days) to produce <b>${resource_bonus}</b> of each mineral`
      resolve(reply);
    });
  });
};

var Calcs_bonus_usage = qs.encode('!bonus <tick=NOW> <bonus=0>');
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

var Calcs_roidcost_usage = qs.encode('!roidcost <roids> <value_cost> [mining_bonus]');
var Calcs_roidcost_desc = 'Calculate how long it will take to repay a value loss capping roids.';
var Calcs_roidcost = (args) => {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(args) || args.length < 1) reject(Calcs_roidcost_usage);
    let roids = numeral(args[0]).value();
    let cost = numeral(args[1]).value();
    let bonus = args.length == 3 ? numeral(args[2]).value() : numeral(0).value();
    let mining = config.pa.roids.mining;
    mining = mining * ((bonus + 100) / 100);
    console.log(`roids: ${roids}`);
    console.log(`cost: ${cost}`);
    console.log(`bonus: ${bonus}`);
    console.log(`mining: ${mining}`);
    let ticks = (cost * config.pa.numbers.ship_value) / (roids * mining);
    console.log(`ticks: ${ticks}`);
    let reply = `Capping <b>${roids}</b> roids at <b>${cost}</b> value with <b>${bonus}</b> bonus will repay in <b>${ticks}</b> ticks (${Math.trunc(ticks / 24)} days)`;
    let goverments = config.pa.governments;
    for (var gov in goverments) {
      let goverment = goverments[gov];
      bonus = goverment.prodcost;
      if (bonus == 0) continue;
      ticks_b = ticks * (1 + bonus);
      reply += ` <b>${goverment.name}</b>: <b>${ticks_b}</b> ticks (${Math.trunc(ticks_b/24)} days)`
    }

    resolve(reply);
  });
};

var Calcs_tick_usage = qs.encode('!tick <tick=NOW> <timezone=GMT>');
var Calcs_tick_desc = 'Calculate when a tick will occur.';
var Calcs_tick = (args) => {
  return new Promise(async (resolve, reject) => {
    let now = await Tick.findOne().sort({ id: -1 });
    var tick = numeral(args.length > 0 ? args[0] : now.id).value()
    if (tick == null) reject(`tick provided must be a number`);
    var timezone = args.length > 1 ? args[1] : "GMT";
    if (moment.tz.zone(timezone) == null) reject(`invalid timezone: ${timezone}`);

    let dt = moment.utc(); //moment(now.timestamp);
    let diff = tick - now.id;
    if (tick == now.id) diff = 0; //why this line?
    dt = typeof(now.timestamp) != "undefined" ? moment(now.timestamp) : dt.add(diff, 'hours');
    dt = dt.tz(timezone);

    var reply;
    if (diff == 0) {
      reply = `It is currently tick ${now.id} (${dt.format('ddd')} ${dt.format('D')}/${dt.format('MM')} ${dt.format('HH')}:${dt.format('mm')} <i>${timezone.toUpperCase()}</i>)`;
    } else {
      reply = `Tick <b>${tick}</b> is expected to happen in ${diff} ticks (${dt.format('ddd')} ${dt.format('D')}/${dt.format('MM')} ${dt.format('HH')}:00 <i>${timezone.toUpperCase()}</i>)`;
    }
    resolve(reply);
  });
};

var Calcs_lookup_usage = qs.encode('!lookup <nick|coords|default=user>');
var Calcs_lookup_desc = 'Lookup a current users stats (score/value/xp/size)';
var Calcs_lookup = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    console.log(args);
    console.log(current_member);
    let planet = null;
    if (args == null || args.length == 0) {
      console.log(`Looking up via TG user who made command: ${current_member.panick}`);
      planet = await Planets.findOne({id:current_member.planet_id});
      console.log(planet);
      if (!planet) {
        reject(formatInvalidResponse(username));
        return;
      }
    } else if (args.length > 0) {
      console.log(`Looking up via argument: ${args[0]}`);
      // try username lookup
      planet = await memberToPlanetLookup(args[0]);
      console.log(`username planet lookup ${planet}`);
      if (!planet) {
        // try coord lookup
        console.log(`trying coord lookup: ${args[0]}`);
        planet = await Utils.coordsToPlanetLookup(args[0]);
      }
    }

    if (!planet) {
      reject(formatInvalidResponse(args[0]));
      return;
    }

    // now that we have a planet do the stats
    let score_rank = await getRank(planet.score, 'score', planet.id);
    let value_rank = await getRank(planet.value, 'value', planet.id);
    let xp_rank = await getRank(planet.xp, 'xp', planet.id);
    let size_rank = await getRank(planet.size, 'size', planet.id);
    let coords_name = `${planet.x}:${planet.y}:${planet.z} (${planet.race}) '${planet.rulername}' of '${planet.planetname}'`
    resolve(`<b>${coords_name}</b> ${score_rank} ${value_rank} ${xp_rank} ${size_rank}`);
  });
};

var Calcs_refsvsfcs_usage = qs.encode('!refsvsfcs <roids> <metal ref #> <crystal ref #> <eonium ref #> <FC #> <gov> <mining population> <cores>');
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
    let goverments = config.pa.governments;
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
    console.log(`now.id ${now.id}`); 
    let ticksLeft = 1157 - now.id;//numeral(config.pa.tick.end).value() - numeral(now.id).value();
    console.log(`ticks left ${ticksLeft}`);

    // Assume they will build the cheapest refinery next. This is always the most efficient thing to do for maxing income anyway.
    let lowestRef = Math.min(metal_ref, crystal_ref, eon_ref); 
    let baseRefCost = config.pa.construction.baseRefCost;
    let baseFCCost = config.pa.construction.baseFCCost;
    let fcBonus = config.pa.construction.fcBonus;
    let roidIncome = config.pa.roids.mining;
    let refIncome = config.pa.construction.refIncome;

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
    var eorRefGenCU = Math.round(eorRefGen / config.pa.construction.refCU);
    var eorFCGenCU = Math.round(eorFCGen / config.pa.construction.fcCU);

    // return results
    if (eorRefGenCU >= eorFCGenCU) {
      resolve(`<b>Build Refineries</b>\nFor every CU spent on FC you will generate <b>${eorFCGenCU}</b> resources by EOR.\nFor every CU spent on Refineries you will generate <b>${eorRefGenCU}</b> resources by EOR.`);
    } else {
      resolve(`<b>Build Finance Centres</b>\nFor every CU spent on FC you will generate <b>${eorFCGenCU}</b> resources by EOR.\nFor every CU spent on Refineries you will generate <b>${eorRefGenCU}</b> resources by EOR.`);
    }
  })
};

function getRank(value, type, planet_id) {
  var sort = {}
  sort[type] = 'desc';
  return new Promise(async (resolve) => {
    let rank = await getRankBySort(sort, planet_id);
    let title = type == 'xp' ? type.toUpperCase() : type[0].toUpperCase() + type.substring(1);
    resolve(`<b>${title}</b>: ${value} (${rank})`);
  });
}

function getRankBySort(sort, planet_id) {
  return new Promise(async (resolve) => {
    var planet_not_null = (p) => p && p.score && p.value && p.xp && p.size && p.id;
    var ranked = await Planets.find(planet_not_null).sort(sort);

    // this will be super inefficient until we get the rank supplied by Frodo during planet loading
    for (var rank = 1; rank < ranked.length; rank++) {
      var planet = ranked[rank - 1];
      if (planet.id == planet_id) {
        resolve(rank);
      }
    }
  });
}

function formatInvalidResponse(str) {
  return `Sorry I don't know who ${str} or they don't have coords set.`;
}

function coordsToPlanetLookup(coordstr) {
  return new Promise(async (resolve, reject) => {
    // try coord lookup
    var coords = Utils.parseCoords(coordstr);
    if (!coords) {
      reject(formatInvalidResponse(coordstr));
      return;
    }

    Planets.find().then((planets) => {
      console.log(`planet length ${planets.length}`);
      var planet = planets.find(p => p && p.x && p.y && p.z && p.x == coords.x && p.y == coords.y && p.z == coords.z);
      console.log(planet);
      if (!planet) {
        reject(null);
        return;
      }
      resolve(planet);
    });
  });
}

function memberToPlanetLookup(username) {
  return new Promise(async (resolve, reject) => {
    Members.find().then((members) => {
      console.log(members.length);
      var member = members.find(m => (m.username != null && m.username.toLowerCase().startsWith(username)) || (m.panick != null && m.panick.toLowerCase().startsWith(username)) || (m.first_name != null && m.first_name.toLowerCase().startsWith(username)));
      //var member = members.find(m => m.username == "blanq4");
      if (member) {
        console.log(member);
        Planets.find().then((planets) => {
          if (planets) {
            planet = planets.find(p => p.id == member.planet_id);
            if (!planet || !planet.x || !planet.y || !planet.z) {
              resolve(null);
            } else {
              console.log(planet);
              resolve(planet);
            }
          }
        });
      } else {
        console.log(`couldn't find member planet`);
        resolve(null);
      }
    });
  });
}

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
  "lookup": { usage: Calcs_lookup_usage, description: Calcs_lookup_desc, cast: Calcs_lookup, include_member: true },
  "bonus": { usage: Calcs_bonus_usage, description: Calcs_bonus_desc, cast: Calcs_bonus },
  "bonusmining": { usage: Calcs_bonusmining_usage, description: Calcs_bonusmining_desc, cast: Calcs_bonusmining },
  "refsvsfcs": { usage: Calcs_refsvsfcs_usage, description: Calcs_refsvsfcs_desc, cast: Calcs_refsvsfcs },
};

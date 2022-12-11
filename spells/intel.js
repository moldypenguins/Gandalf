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
 * @name intel.js
 * @version 2021/06/07
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const FNCS = require('../Functions');
const Mordor = require('../Mordor');

const Intel = require('../models/Intel');
const Planet = require('../models/Planet');
const Alliance = require('../models/Alliance');
const Member = require('../models/Member');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require('util');




//######################################################################################################################
//TODO: replace below functions either with mongoose models or Functions - const FNCS = require('../Functions');

function getRank(value, type, planet_id) {
  var sort = {};
  sort[type] = 'desc';
  return new Promise(async (resolve) => {
    let rank = await getRankBySort(sort, planet_id);
    let title = type === 'xp' ? type.toUpperCase() : type[0].toUpperCase() + type.substring(1);
    resolve(`<b>${title}</b>: ${value} (${rank})`);
  });
}

function getRankBySort(sort, planet_id) {
  return new Promise(async (resolve) => {
    var planet_not_null = (p) => p && p.score && p.value && p.xp && p.size && p.id;
    var ranked = await Planet.find(planet_not_null).sort(sort);

    // this will be super inefficient until we get the rank supplied by Frodo during planet loading
    for (var rank = 1; rank < ranked.length; rank++) {
      var planet = ranked[rank - 1];
      if (planet.id === planet_id) {
        resolve(rank);
      }
    }
  });
}



const INTEL_ACTION_DISPLAY = 0, INTEL_ACTION_SET = 1
const PLANET_COORD_TYPE = 0, GALAXY_COORD_TYPE = 1;

function parseArgs(args) {
// coords will always be 0
let coords = FNCS.parseCoords(args[0]); // may be gal 1.2.* or planet 1.2.3
//let type = FNCS.coordType(coords);
let rval = {coords: coords};//, type: type};

// display
if (args.length === 1) {
return Object.assign(rval, {action:INTEL_ACTION_DISPLAY});
}

// assinging
rval = Object.assign(rval, {action:INTEL_ACTION_SET});

// setting alliance
if (args.length > 1) {
rval['alliance'] = args[1];
}

// setting nick
if (args.length > 2) {
rval['nick'] = args[2];
}

return rval;
}

async function intelDisplayPlanet(coords) {
let response = `${coords.x}:${coords.y}:${coords.z}`;
let planet = await Planet.findOne({x: coords.x, y:coords.y, z: coords.z});
if (planet) {
let intel = await Intel.findOne({planet_id: planet.id});
if (intel) {
console.log(`intel: ${JSON.stringify(intel)}`);
let alliance = await Alliance.findOne({ _id: intel.alliance_id});
console.log(`alliance: ${JSON.stringify(alliance)}`);
if (alliance && alliance.name) {
response += `\t<b>${alliance.name}</b>`
}
if (intel.nick) {
response += `\t<b>${intel.nick}</b>`
} else {
response += `\t<i>Nick not set</i>`
}
return response + '\n';
}
return response + `\tNone\n`;
}
return '\n';
}

async function intelDisplayGalaxy(coords) {
let response = `Intel ${coords.x}:${coords.y}\n`;
for(let i = 1; i < 14; i++) {
response += await intelDisplayPlanet({x:coords.x, y:coords.y, z: i});
}
if (!response) {
return `No intel found for galaxy ${coords.x}:${coords.y}.`
}
return response;
}

async function intelDisplay(args) {
switch(args.type) {
case GALAXY_COORD_TYPE:
return await intelDisplayGalaxy(args.coords);
case PLANET_COORD_TYPE:
let response = await intelDisplayPlanet(args.coords);
if (!response) {
response = `No intel found for planet ${args.coords.x}:${args.coords.y}:${args.coords.z}`;
}
return response;
}
}

function coordsToPlanetLookup(input) {
  return new Promise(async (resolve, reject) => {
    let coords = FNCS.parseCoords(input);
    if (!coords) {
      reject(formatInvalidResponse(input));
      return;
    }

    Planet.find().then((planets) => {
      let planet = planets.find(p => p && p.x && p.y && p.z && p.x == coords.x && p.y == coords.y && p.z == coords.z);
      if (!planet) {
        resolve(null);
        return;
      }
      resolve(planet);
    });
  });
}

function formatInvalidResponse(str) {
  return `Sorry I don't know who ${str} or they don't have coords set.`;
}

async function intelSet(args) {
if (args.type === GALAXY_COORD_TYPE) {
return `You can't set intel for an entire galaxy gtfo.`;
}

let coords = args.coords;
let planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z});
if (!planet) {
return `No planet found`; // for ${x}:${y}:${z}!!`;
}

let intel = await Intel.findOne({planet_id: planet.id});
if (!intel) {
intel = new Intel({planet_id: planet.id});
}

if (args.alliance) {
console.log(`finding alliance by name ${args.alliance}`);
// let alliance = await Alliance.findByName(args.alliance);
let alliance = await Alliance.findOne({"name": new RegExp(args.alliance, 'i')});
//console.log(alliance._id);
//console.log(alliance.name);
if (!alliance) {
return `No alliance found for ${args.alliance}!!`;
}

intel.alliance_id = 5;
console.log(intel);
}

if (args.nick) {
intel.nick = args.nick;
}

await intel.save();
let alliance = await Alliance.findOne({ _id: intel.alliance_id});
return `Intel saved for ${coords.x}:${coords.y}:${coords.z} ${alliance.name}/${intel.nick}`;
}

let Intel_usage = he.encode('!intel <coords> <alliance> <nick>');
let Intel_desc = 'Displays or sets intel for given coords.';
let Intel_fn = (args) => {
return new Promise(async (resolve) => {
let parsed = parseArgs(args);
console.log(parsed);
switch (parsed.action) {
default:
case INTEL_ACTION_DISPLAY:
resolve(await intelDisplay(parsed));
case INTEL_ACTION_SET:
resolve(await intelSet(parsed));
}
});
};

//######################################################################################################################

let Intel_spam_usage = he.encode('!spam <alliance>');
let Intel_spam_desc = 'Displays a set of coords based on alliance';
let Intel_spam = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length === 0) {
      reject(Intel_spam_usage);
    }

    let alliance = await Alliance.findOne({"name": new RegExp(args[0], 'i')});
	if (!alliance) {
		var response = 'Alliance not found!';
	} else {
		var response = `Spam for <b>${alliance.name}</b>\n`;
		let intels = await Intel.find({alliance: alliance});
		for(let intel of intels) {
			let planet = await Planet.findOne({_id: intel.planet});
			if (planet && planet.x && planet.y && planet.z) {
			response += `${planet.x}:${planet.y}:${planet.z} `;
			}
		}
	}
    resolve(response);
  });
};

let Intel_spamset_usage = he.encode('!spamset <alliance> <coords list>');
let Intel_spamset_desc = 'Set alliance for multiple coords at once';
let Intel_spamset = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length < 2) {
      reject(Intel_spamset_usage);
    }

    let alliance = await Alliance.findOne({"name": new RegExp(args[0], 'i')});
	if (!alliance) {
		var response = 'Alliance not found!';
	} else {
		for(let i = 1; i < args.length; i++) {
		  let planet = await coordsToPlanetLookup(args[i]);
		  console.log(planet);
		  let intel = await Intel.findOne({planet: planet});
		  if (!intel) {
			console.log(`creating new intel`);
			intel = new Intel({
				_id: new Mordor.Types.ObjectId(),
				planet: planet
			});
		  }
		  intel.alliance = alliance;		  
		  await intel.save();
		  console.log(`intel saved for ${intel}`);
		}
		var response = `Spam for <b>${alliance.name}</b> set.\n`;
	}
	resolve (response);
  });
};

let Intel_oomph_usage = he.encode('!oomph <alliance> <ship_class>');
let Intel_oomph_desc = 'List alliance ship counts versus given ship class.';
let Intel_oomph = (args) => {
  return new Promise(async (resolve, reject) => {
    resolve('Coming Soon');
    //`${alliance} (49 members, 50 in intel, 50 with fresh scans) has 86m oommph against Corvette: 141 Harpy 315k Spider 189k Phantom 156k Recluse 198k Ghost`
  });
};


let Intel_lookup_usage = he.encode('!lookup <nick|coords|default=self>');
let Intel_lookup_desc = 'Lookup a current users stats (score/value/xp/size)';
let Intel_lookup = (args, current_member) => {
  return new Promise(async (resolve, reject) => {
    let planet = null;
    if(args[0]) {
      //console.log(`args: ${args}`);
      let coords = FNCS.parseCoords(args[0]);
      if(Object.keys(coords).length === 3) {
        planet = await Planet.findOne({x:coords.x, y:coords.y, z:coords.z});
      } else {
        let mem = await Member.findOne({pa_nick: {$regex: args[0]}});
        if (!mem) {
          reject(`Sorry, I don't know ${args[0]} or they don't have coords set.`);
        } else {
          planet = mem.planet;
        }
      }
    } else {
      //console.log(`current_member.planet: ${current_member.planet}`);
      if(!current_member.planet) {
        reject(`You don't have your coords set.`);
      } else {
        planet = current_member.planet;
      }
    }
    if(!planet) {
      reject(`Sorry, I cannot find ${args[0]}.`);
    } else {
      resolve(`<b>${planet.x}:${planet.y}:${planet.z} (${planet.race}) '${planet.rulername}' of '${planet.planetname}'</b>\n` +
      `<b>Score:</b> ${numeral(planet.score).format('0,0')} (${planet.score_rank})\n` +
      `<b>Value:</b> ${numeral(planet.value).format('0,0')} (${planet.value_rank})\n` +
      `<b>XP:</b> ${numeral(planet.xp).format('0,0')} (${planet.xp_rank})\n` +
      `<b>Size:</b> ${numeral(planet.size).format('0,0')} (${planet.size_rank})`);
    }
  });
};









module.exports = {
  "lookup": { usage: Intel_lookup_usage, description: Intel_lookup_desc, cast: Intel_lookup, include_member: true },
  "intel": { usage: Intel_usage, description: Intel_desc, cast: Intel_fn },
  "spam": { usage: Intel_spam_usage, description: Intel_spam_desc, cast: Intel_spam },
  "spamset": { usage: Intel_spamset_usage, description: Intel_spamset_desc, access: AXS.botCommandRequired, cast: Intel_spamset },
  "oomph": { usage: Intel_oomph_usage, description: Intel_oomph_desc, cast: Intel_oomph },
};


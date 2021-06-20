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

const Intel = require('../models/Intel');
const Planet = require('../models/Planet');
const Alliance = require('../models/Alliance');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');

const INTEL_ACTION_DISPLAY = 0, INTEL_ACTION_SET = 1

function parseArgs(args) {
// coords will always be 0
let coords = FNCS.parseCoords(args[0]); // may be gal 1.2.* or planet 1.2.3
let type = FNCS.coordType(coords);
let rval = {coords: coords, type: type};

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
case Utils.GALAXY_COORD_TYPE:
return await intelDisplayGalaxy(args.coords);
case Utils.PLANET_COORD_TYPE:
let response = await intelDisplayPlanet(args.coords);
if (!response) {
response = `No intel found for planet ${args.coords.x}:${args.coords.y}:${args.coords.z}`;
}
return response;
}
}

async function intelSet(args) {
if (args.type == Utils.GALAXY_COORD_TYPE) {
return `You can't set intel for an entire galaxy gtfo.`;
}

let coords = args.coords;
let planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z});
if (!planet) {
return `No planet found for ${x}:${y}:${z}!!`;
}

let intel = await Intel.findOne({planet_id: planet.id});
if (!intel) {
intel = new Intel({planet_id: planet.id});
}

if (args.alliance) {
console.log(`finding alliance by name ${args.alliance}`);
// let alliance = await Alliance.findByName(args.alliance);
let alliance = await Alliance.findOne({"name": new RegExp(args.alliance, 'i')});
console.log(alliance._id);
console.log(alliance.name);
if (!alliance) {
return `No alliance found for ${args.alliance}!!`;
}

intel.alliance_id = alliance._id;
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
let Intel_desc = 'Displays or sets a coords';
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


let Intel_spam_usage = he.encode('!spam <alliance>');
let Intel_spam_desc = 'Displays a set of coords based on alliance';
let Intel_spam = (args) => {
return new Promise(async (resolve, reject) => {
if (args.length == 0) {
reject(Intel_spam_usage);
return;
}

let alliance = await Alliance.findOne({"name": new RegExp(args[0], 'i')});
let response = `Spam for <b>${alliance.name}</b>\n`;
let intels = await Intel.find({alliance_id: alliance._id});
for(let intel of intels) {
let planet = await Planet.findOne({id: intel.planet_id});
if (planet && planet.x && planet.y && planet.z)
response += `${planet.x}:${planet.y}:${planet.z} `;
}
resolve(response);
});
};

let Intel_spamset_usage = he.encode('!spamset <alliance> <coords list>');
let Intel_spamset_desc = 'Set of alliance for multiple coords at once';
let Intel_spamset = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length < 2) {
    reject(Intel_spamset_usage);
    return;
    }

    let alliance = await Alliance.findOne({"name": new RegExp(args[0], 'i')});
    for(let i = 1; i < args.length; i++) {
    let planet = await Utils.coordsToPlanetLookup(args[i]);
    console.log(planet);
    let intel = await Intel.findOne({planet_id: planet.id});
    if (!intel) {
    console.log(`creating new intel`);
    intel = new Intel({planet_id: planet.id});
    }

    intel.alliance_id = alliance._id;
    await intel.save();
    console.log(`intel saved for ${intel}`);
    }
    resolve(`Spam for <b>${alliance.name}</b> set.\n`);
  });
};



let Intel_oomph_usage = he.encode('!oomph <alliance> <ship class>');
let Intel_oomph_desc = 'List alliance ships';
let Intel_oomph = (args) => {
  return new Promise(async (resolve, reject) => {
    //`${alliance} (49 members, 50 in intel, 50 with fresh scans) has 86m oommph against Corvette: 141 Harpy 315k Spider 189k Phantom 156k Recluse 198k Ghost`
  });
};





module.exports = {
  "intel": { usage: Intel_usage, description: Intel_desc, cast: Intel_fn },
  "spam": { usage: Intel_spam_usage, description: Intel_spam_desc, cast: Intel_spam },
  "spamset": { usage: Intel_spamset_usage, description: Intel_spamset_desc, access: AXS.botCommandRequired, cast: Intel_spamset },
  //"oomph": { usage: Intel_oomph_usage, description: Intel_oomph_desc, cast: Intel_oomph },
};


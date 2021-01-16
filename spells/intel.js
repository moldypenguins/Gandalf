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

const Utils = require('../utils');
const Intel = require('../models/intel');
const Planet = require('../models/planet');
const Alliance = require('../models/alliance');

const INTEL_ACTION_DISPLAY = 0, INTEL_ACTION_SET = 1

function parseArgs(args) {
    // coords will always be 0
    let coords = Utils.parseCoords(args[0]); // may be gal 1.2.* or planet 1.2.3
    let type = Utils.coordType(coords);
    let rval = {coords: coords, type: type};

    // display
    if (args.length == 1) {
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
            if (intel.nick) {
                response += `\t<b>${intel.nick}</b>`
            } else {
                response += `\t<b>Nick not set</b>`
            }
            let alliance = await Alliance.findOne({id: intel.alliance_id});
            console.log(`alliance: ${JSON.stringify(alliance)}`);
            if (alliance && alliance.name) {
                response += `\t<b>${alliance.name}</b>`
            }
            return response + '\n';
        }
    }
    return;
}

async function intelDisplayGalaxy(coords) {
    let response = `Intel ${coords.x}:${coords.y}`;
    for(let i = 1; i < 10; i++) {
        response += await intelDisplayPlanet({x:coords.x, y:coords.y, z: i});
    }
    if (!!response) {
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
        let alliance = await Alliance.findByName(args.alliance);
        if (!alliance) {
            return `No alliance found for ${args.alliance}!!`;
        }

        intel.alliance_id = alliance.id;
    }

    if (args.nick) {
        intel.nick = args.nick;
    }

    await intel.save();
    return `Intel saved for ${coords.x}:${coords.y}:${coords.z}`;
}

let Intel_usage = he.encode('!intel <coords> <alliance> <nick>');
let Intel_desc = 'Displays or sets a coords';
let Intel_fn = (args) => {
    return new Promise(async (resolve, reject) => {
        let parsed = parseArgs(args);
        console.log(parsed);
        switch (parsed.action) {
            default:
            case INTEL_ACTION_DISPLAY:
                resolve(await intelDisplay(parsed));
            case INTEL_ACTION_SET:
                resolve(await intelSet(parsed));
        }
    })
};


let output = (intel) => {
    return new Promise(async (resolve) => {
        console.log(intel.alliance_id);
        console.log({ _id: `ObjectId(${intel.alliance_id})` });
        let alliance = await Alliance.findOne({ _id: `ObjectId("${intel.alliance_id}")` });
        console.log(alliance);
        let alliance_text = ``;
        if (alliance) alliance_text = `Alliance: <b>${alliance.name}</b>`;
        resolve(`Nick: <b>${intel.nick}</b>\n${alliance_text}`);
    });
};

module.exports = {
    "intel": { usage: Intel_usage, description: Intel_desc, cast: Intel_fn }
};


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
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const Utils = require('../utils');
const Intel = require('../models/intel');
const Planet = require('../models/planet');
const Alliance = require('../models/alliance');

let Intel_usage = entities.encode('!intel <coords> <alliance=alliance> <nick=nick>');
let Intel_desc = 'Displays or sets a coords';
let Intel_fn = (args) => {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(args) || args.length < 1) { reject(Intel_usage); }
        let coords = Utils.parseCoords(args[0]);
        if (coords === undefined) {
            reject(`Cannot parse provided coords: ${args[0]}`)
        } else {
            if (args.length === 1 && coords.x && coords.y && !coords.z) {
                let reply = `Intel for ${coords.x}:${coords.y}:\n`;
                for (let i = 1; i < 12; i++) {
                    let planet = await Planet.findOne({ x: coords.x, y: coords.y, z: i });
                    if (planet) {
                        let intel = await Intel.findOne({planet_id: planet.id});
                        if (intel) {
                            let alliance_text = ``;
                            if (intel.alliance_id) {
                                let alliance = await Alliance.findOne({id: intel.alliance_id});
                                if (alliance) alliance_text = `<b>${alliance.name}</b>`;
                            }
                            reply += `${i}: <b>${intel.nick}</b> ${alliance_text}\n`
                        }
                    }
                }
                resolve(reply);
            } else if (args.length === 1 && coords.x && coords.y && coords.z) {
                let planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z });
                if (!planet) {
                    reject(`(1) No planet found for ${coords.x}:${coords.y}:${coords.z}`);
                }
                let intel = await Intel.findOne({planet_id: planet.id});
                let reply = "";
                if (!intel) {
                    reply = `No intel stored for ${coords.x}:${coords.y}:${coords.z}`;
                } else {
                    reply = `Intel for ${coords.x}:${coords.y}:${coords.z}\n` + await output(intel)
                }
                resolve(reply);
            } else {
                let planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z });
                if (!planet) {
                    reject(`(2) No planet found for ${coords.x}:${coords.y}:${coords.z}`);
                }
                let intel = await Intel.findOne({ planet_id: planet.id });
                if (!intel) {
                    intel = new Intel({ planet_id: planet.id });
                }
                for (let item of args.slice(1)) {
                    let split = item.split("=");
                    if (split.length !== 2) {
                        reject(Intel_usage);
                        return;
                    }
                    let key = split[0];
                    let value = split[1];
                    switch (key.toLowerCase()) {
                        case 'nick':
                            intel.nick = value;
                            break;
                        case 'alliance': {
                            let alliances = await Alliance.find();
                            console.log(value);
                            let alliance = alliances.find(a => a.name.toLowerCase().startsWith(value.toLowerCase()) || a.name.toLowerCase().includes(value.toLowerCase()) || (a.alias !== undefined && a.alias.toLowerCase() === value.toLowerCase()));
                            console.log(alliance);
                            if (!alliance) {
                                reject(`No alliance found for: <b>${value}</b>`);
                                return;
                            }
                            intel.alliance_id = alliance.id;
                            break;
                        }
                        default:
                            reject(`Haven't added that intel command yet: ${key}`);
                            return;
                    }
                }
                await intel.save();
                resolve(`Added intel for ${coords.x}:${coords.y}:${coords.z}\n${await output(intel)}`);
            }

        }
    });
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


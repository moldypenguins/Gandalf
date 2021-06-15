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
 * @name members.js
 * @version 2021/06/14
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const Members = require('../models/Member');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require("util");


let Members_contact_usage = he.encode('!contact <user>');
let Members_contact_desc = 'Displays a users TG username';
let Members_contact = (args, ctx) => {
    return new Promise(function (resolve, reject) {
        if (!Array.isArray(args) || args.length < 1) { reject(Comms_contact_usage); }
        Members.find().then((members) => {
            var username = args[0].toLowerCase();
            var member = members.find(m => (m.panick != null && m.panick.toLowerCase().startsWith(username)) || (m.first_name != null && m.first_name.toLowerCase().startsWith(username)));
            if (member == null) {
                reject(`Sorry I don't know who ${args[0]} is`);
                return;
            }
            resolve(`Contact: <a href="tg://user?id=${member.id}">${member.panick != null ? member.panick : member.username}</a>`);
        });
    });
};


let Members_lookup_usage = he.encode('!lookup <nick|coords|default=user>');
let Members_lookup_desc = 'Lookup a current users stats (score/value/xp/size)';
let Members_lookup = (args, current_member) => {
    return new Promise(async (resolve, reject) => {
        console.log(args);
        console.log(current_member);
        let planet = null;
        if (args == null || args.length === 0) {
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
                planet = await Functions.coordsToPlanetLookup(args[0]);
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






//######################################################################################################################
//TODO: replace below functions either with mongoose models or Functions - const FNC = require('../Functions');

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
        var coords = Functions.parseCoords(coordstr);
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

//######################################################################################################################




module.exports = {
    "contact": { usage: Members_contact_usage, description: Members_contact_desc, access: AXS.botMemberRequired, cast: Members_contact, include_ctx: true },
    "lookup": { usage: Members_lookup_usage, description: Members_lookup_desc, cast: Members_lookup, include_member: true },
};

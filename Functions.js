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
 * @name functions.js
 * @version 2021/05/25
 * @summary utility functions
 **/
'use strict';


const Planet = require('./models/Planet');



/*
let patterns = [ //Note these are order dependent xyz has to come before xy
	    /([\d]+)\.([\d]+)\.([\d]+)/, //dots
	    /([\d]+):([\d]+):([\d]+)/, // :
	    /([\d]+)\s([\d]+)\s([\d]+)/, // spaces
	    /([\d]+)\.([\d]+)/, //galaxy dots
	    /([\d]+):([\d]+)/, //galaxy :
	    /([\d]+)\s([\d]+)/, //galaxy spaces
];

function parseCoords(input) {
	for (let regex of patterns) {
		let matches = regex.exec(input);
		if (matches) {
			if (matches.length == 4) {
				return {x: +matches[1], y: +matches[2], z: +matches[3]};
			} else if (matches.length == 3) {
				return {x: +matches[1], y: +matches[2]};
			}
		}
	}
	return null;
}

const PLANET_COORD_TYPE = 0, GALAXY_COORD_TYPE = 1;

function coordType(coords) {
	if (coords.x && coords.y && coords.z) {
		return PLANET_COORD_TYPE;
	} else {
		return GALAXY_COORD_TYPE;
	}
}

function coordsToPlanetLookup(input) {
	return new Promise(async (resolve, reject) => {
		let coords = parseCoords(input);
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

*/






//var id = require('mongodb').ObjectID(doc._id);
//.findOne({_id: new ObjectId(id)}
//.findById("5e12d86186d564bd4487658c", function(err, result) {













let isValidDate = function(d) {
	//return Object.prototype.toString.call(d) === '[object Date]' && isFinite(d);
	return d instanceof Date && !isNaN(d);
};


let getTelegramMentionName = function(m) {
	let result = m.first_name;
	if(m.username) {
		result = m.username;
	} else if(m.last_name) {
		result = `${m.first_name} ${m.last_name}`;
	}
	return result;
};






module.exports = {
	"isValidDate": isValidDate,
	"getTelegramMentionName": getTelegramMentionName,
};

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
 * @version 2021/08/29
 * @summary utility functions
 **/
'use strict';

const Planet = require('./models/Planet');
const util = require('util');


let isValidDate = function(d) {
	//return Object.prototype.toString.call(d) === '[object Date]' && isFinite(d);
	return d instanceof Date && !isNaN(d);
};

let getTelegramName = function(u) {
	//console.log('u: ' + util.inspect(u, false, null, true));
	let mention_name = u.telegram_first_name;
	if(u.telegram_username) {
		mention_name = u.telegram_username;
	} else if(u.telegram_last_name) {
		mention_name = `${u.telegram_first_name} ${u.telegram_last_name}`;
	}
	return mention_name;
};

let parseCoords = function(c) {
	let matches = c.match(/(\d+)[:.](\d+)[:.](\d+)/);
	if (matches) {
		if (matches.length === 4) {
			return {x: +matches[1], y: +matches[2], z: +matches[3]};
		} else if (matches.length === 3) {
			return {x: +matches[1], y: +matches[2]};
		}
	}
};


module.exports = {
	"isValidDate": isValidDate,
	"getTelegramName": getTelegramName,
	"parseCoords": parseCoords,
};

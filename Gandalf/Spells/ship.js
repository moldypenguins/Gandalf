"use strict";
/**
 * Gandalf
 * Copyright (c) 2020 Gandalf Planetarion Tools
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
 * @name ship.js
 * @version 2023/01/21
 * @summary Gandalf Spells
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Ship } from "mordor";


import { encode } from "html-entities";
import numeral from "numeral";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


export default async (params) => {
    let reply;

    if(!params.ship) {
        reply = "Ship must be provided.";
    } else {
        let _ship = await Ship.findOne({name: new RegExp(params.ship + ".*", "i")});
        //console.log(`SHIP: ${util.inspect(_ship, true, null, true)}`);
  
        if(!_ship) {
            reply = "Ship not found.";
        }
        else {
            reply = `${_ship.name} (${_ship.race})\nClass: ${_ship.class}\nTarget 1: ${_ship.target1}`;
            if(_ship.target2 !== "-") {
                reply += `\nTarget 2: ${_ship.target2}`;
            }
            if(_ship.target3 !== "-") {
                reply += `\nTarget 3: ${_ship.target3}`;
            }
            reply += `\nType: ${_ship.type}\nCloaked: ${_ship.cloaked ? "Yes" : "No"}\nInit: ${_ship.initiative}`;
            reply += `\nEMP Res: ${_ship.empres}`;
            if(_ship.type.toLowerCase() === "emp") {
                reply += `\nGuns: ${_ship.guns}`;
            }
            reply += `\nD/C: ${_ship.damagecost}\nA/C: ${_ship.armorcost}\nBase ETA: ${_ship.baseeta}`;
        }
    }
    return reply;
};

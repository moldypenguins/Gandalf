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
 * @name tick.js
 * @version 2023/01/21
 * @summary Gandalf Spells
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Tick } from "mordor";


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
    if(params.tick || params.timezone) {
        //validate here
    }
    let tick = await Tick.findLastTick();
    if(!tick) {
        reply = "Cannot find current tick.";
    }
    else {
        if (!params.tick || tick.tick === params.tick) {
            reply = `It is currently tick ${tick.tick}`;
        } else {
            if (params.tick > tick.tick) {
                reply = `Tick ${params.tick} is expected to happen in ${params.tick - tick.tick} ticks`;
            } else {
                reply = `Tick ${params.tick} happened ${tick.tick - params.tick} ticks ago`;
            }
        }
        let ticktime = dayjs(tick.timestamp).utc().add(params.tick - tick.tick, "hour");
        if (params.timezone) {
            reply += ` (${ticktime.tz(params.timezone).format("YYYY-MM-DD H:mm z")})`;
        } else {
            reply += ` (${ticktime.tz().format("YYYY-MM-DD H:mm z")})`;
        }
    }
    return reply;
};


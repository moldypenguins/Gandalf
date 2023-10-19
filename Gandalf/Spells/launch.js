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
 * @name launch.js
 * @version 2023/01/22
 * @summary Gandalf Spells
 **/


import util from "util";
import Config from "sauron";
import { Mordor, Tick } from "mordor";
import Access from "../access.js";

import { Context } from "telegraf";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";

import { encode } from "html-entities";
import numeral from "numeral";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

//encode("/launch <class|eta> <LT> [timezone]")
//Calculates when ships should be launched to land at LT.

export default async (params) => {
    let reply;
    if(!params.eta || !params.lt) {
        reply = `Usage: ${encode("/eff <number> <ship>")}`;
    } else {
        let now_tick = await Tick.findLastTick();
        let now_time = dayjs(now_tick.timestamp).utc();
        let _timezone = "UTC";
        if (params.tz) {
            try {
                now_time.tz(params.tz);
                _timezone = params.tz;
            } catch (err) {
                _timezone = undefined;
            }
        }
      
        if (!_timezone) {
            reply = `invalid timezone: ${params.tz}`;
        } else {
            let current_time = dayjs().utc();
            let launch_tick = params.lt - params.eta;
            let launch_time = current_time.add(launch_tick - now_tick.tick, "hours");
            let prelaunch_tick = params.lt - params.eta + 1;
            let prelaunch_mod = launch_tick - now_tick.tick;
            reply = `eta ${params.eta} landing pt ${params.lt} (currently ${now_tick.tick}) must launch at pt ${launch_tick} (${launch_time.tz(_timezone).format("YYYY-MM-DD H:55 z")}), or with prelaunch tick ${prelaunch_tick} (currently +${prelaunch_mod})`;
        }
    }
    return reply;
};

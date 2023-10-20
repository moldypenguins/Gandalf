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
 * @name roidcost.js
 * @version 2023/01/25
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

//encode("/roidcost <roids> <value_cost> [pop_mining_bonus]")
//Calculate how long it will take to repay a value loss capping roids.

export default async (params) => {
    let reply;
    if (!params.roids || !params.cost) {
        reply = `Usage: ${encode("/roidcost <roids> <value_cost> [pop_mining_bonus]")}`;
    } else {
        let mining = Config.pa.roids.mining;
        mining = mining * ((params.bonus + 100) / 100);
        console.log(`roids: ${params.roids}`);
        console.log(`cost: ${params.cost}`);
        console.log(`bonus: ${params.bonus}`);
        console.log(`mining: ${mining}`);
        let ticks = (params.cost * Config.pa.numbers.ship_value) / (params.roids * mining);
        console.log(`ticks: ${ticks}`);
        reply = `Capping ${params.roids} roids at ${params.cost} value with ${params.bonus} bonus will repay in ${ticks} ticks (${Math.trunc(ticks / 24)} days)`;
        for (let gov in Config.pa.governments) {
            let bonus = Config.pa.governments[gov].prodcost;
            if (bonus === 0) continue;
            let ticks_b = ticks * (1 + bonus);
            reply += ` - ${Config.pa.governments[gov].name}: ${ticks_b} ticks (${Math.trunc(ticks_b/24)} days)`;      
        }
    }
    return reply;
};

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
 * @name cost.js
 * @version 2023/01/25
 * @summary Gandalf Spells
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Tick, Ship } from "mordor";
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

//encode("/cost <number> <ship>")
//Calculates the cost of producing the specified number of ships.

export default async (params) => {
    let reply;
    if(!params.number || !params.ship) {
        reply = `Usage: ${encode("/cost <number> <ship>")}`;
    } else {
        let ship = await Ship.findOne({$where:`this.name.toLowerCase().startsWith("${params.ship}")`});
        let number = numeral(params.number).value();
        if(!ship) {
            reply = `Cannot find ship ${_ship}`;
        } else {
            reply = `Buying ${numeral(number).format("0a")} ${ship.name} will cost ${numeral(number * Number(ship.metal)).format("0,0")} metal, ${numeral(number * Number(ship.crystal)).format("0,0")} crystal and ${numeral(number * Number(ship.eonium)).format("0,0")} eonium.`;   
        }
    }
    return reply;
};

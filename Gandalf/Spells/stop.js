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
 * @name stop.js
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



//encode("/stop <number> <ship>")
//Calculates the required defense to the specified number of ships.

export default async (params) => {
    let reply;
    if(!params.number || !params.ship) {
        reply = `Usage: ${encode("/stop <number> <ship>")}`;
    } else {            
        // TODO: stop structure killers / roiders
        let ship = await Ship.findOne({$where:`this.name.toLowerCase().startsWith("${params.ship}")`});
        let number = params.number;
        if(!ship) {
            reply = `Cannot find ship ${params.ship}`;
        } else {
            let ships_who_target_class = await Ship.find({ 
                $or:[ 
                    {"target1":ship.class}, 
                    {"target2":ship.class}, 
                    {"target3":ship.class} 
                ]
            });
            reply = `To stop ${numeral(number).format("0a")} ${ship.name} (${numeral(numeral(number).value() * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / Config.pa.numbers.ship_value).format("0a")}) you'll need:\n`;
            let results = [];
            if (ships_who_target_class) {
                results = ships_who_target_class.map(function (shiptarget) {
                    let target = shiptarget.target1 == ship.class ? "target1" : shiptarget.target2 == ship.class ? "target2" : "target3";
                    let efficiency = Config.pa.ships.targeteffs[target];
                    if (shiptarget.type.toLowerCase() == "emp") {
                        let empnumber = Math.trunc((Math.ceil(numeral(number).value() / ((100 - (ship.empres)) / 100) / (shiptarget.guns))) / efficiency);
                        return (`${numeral(empnumber).format("0,0")} ${shiptarget.name} (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format("0a")})`);
                    } else {
                        let targetnumber = Math.trunc((ship.armor * numeral(number).value()) / shiptarget.damage / efficiency);
                        if (shiptarget.initiative > ship.initiative) {
                            targetnumber += Math.trunc(efficiency * shiptarget.damage / ship.armor);
                        }
                        return (`${numeral(targetnumber).format("0,0")} ${shiptarget.name} (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format("0a")})`);
                    }
                });
            }
            reply += results.join("; ");
        }
    }
    return reply;
};

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
 * @name eff.js
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

//encode("/eff <number> <ship>")
//Calculates the efficiency of the specified number of ships.

export default async (params) => {
    let reply;
    if(!params.number || !params.ship) {
        reply = `Usage: ${encode("/eff <number> <ship>")}`;
    } else {
        let ship = await Ship.findOne({$where:`this.name.toLowerCase().startsWith("${params.ship}")`});
        let number = params.number;
        if(!ship) {
            reply = `Cannot find ship ${_ship}`;
        } else {
            let damage = ship.damage !== "-" ? numeral(ship.damage).value() * numeral(number).value() : 0;
            reply = `${numeral(number).format("0,0")} ${ship.name} (${numeral(numeral(number).value() * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / Config.pa.numbers.ship_value).format("0a") })`;

            switch (ship.type.toLowerCase()) {
            case "pod":
                reply += ` will capture ${numeral(damage / 50).format("0,0")} roids`;
                break;
            case "structure":
                reply += ` will destroy ${numeral(damage / 50).format("0,0")} structures`;
                break;
            default:
                reply += ` will ${Config.pa.ships.damagetypes[ship.type.toLowerCase()]}:\n`;
                for(let t in Config.pa.ships.targets) {
                    let target = Config.pa.ships.targets[t];
                    //console.log("TARGET: " + util.inspect(target, false, null, true));
                    if (ship[target] !== "-") {
                        reply += `${t}: ${ship[target]}s (${Config.pa.ships.targeteffs[target] * 100}%)\n`;
                        let shiptargets = await Ship.find({class: ship[target]});
                        //console.log("TARGETED SHIPS: " + util.inspect(shiptargets, false, null, true));
                        if (shiptargets) {
                            var results = shiptargets.map(function (shiptarget) {
                                if (ship.type.toLowerCase() == "emp") {
                                    let empnumber = Math.trunc(Config.pa.ships.targeteffs[target] * ship.guns * numeral(number).value() * (100 - shiptarget.empres) / 100);
                                    return (`${numeral(empnumber).format("0,0")} ${shiptarget.name} (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format("0a")})`);
                                } else {
                                    let targetnumber = Math.trunc(Config.pa.ships.targeteffs[target] * damage / shiptarget.armor);
                                    return (`${numeral(targetnumber).format("0,0")} ${shiptarget.name} (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format("0a")})`);
                                }
                            });
                            reply += results.join("; ") + "\n";
                        }
                    }
                }
                break;
            }   
        }
    }
    return reply;
};

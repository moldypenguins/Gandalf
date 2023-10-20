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
 * @name Ship.js
 * @version 2023/04/20
 * @summary Circuit command
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Ship } from "mordor";
import Spells from "../Spells/Book.js";

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


export default {
    data: new SlashCommandBuilder()
        .setName("prodtime")
        .setDescription("Calculate ticks taken to produce ships costing <total resources> (assumes Soc & 60 pop if blank)")
        .addIntegerOption(o => o.setName("resources").setDescription("Total resources in production").setRequired(true).setMinValue(0))
        .addIntegerOption(o => o.setName("factories").setDescription("No. factories").setRequired(true).setMinValue(0))
        .addStringOption(o => o.setName("race").setDescription("Race").setRequired(true))
        .addStringOption(o => o.setName("govt").setDescription("Government type").setRequired(false))
        .addIntegerOption(o => o.setName("pop_bonus").setDescription("Shipwrights pop bonus").setRequired(false).setMinValue(0)),
    async execute(interaction) {
        let _p1 = interaction.options.getInteger("resources");
        let _p2 = interaction.options.getInteger("factories");
        let _p3 = interaction.options.getString("race");
        let _p4 = interaction.options.getString("govt");
        let _p5 = interaction.options.getInteger("pop_bonus");
        let _reply = await Spells.prodtime({resources: _p1, factories: _p2, race: _p3, govt: _p4, pop_bonus: _p5});
        await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
};



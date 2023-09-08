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
 * @name Tick.js
 * @version 2023/04/20
 * @summary Circuit command
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Tick } from "mordor";
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
        .setName("tick")
        .setDescription("Shows the time of the current/given tick.")
        .addIntegerOption(o => o.setName("tick").setDescription("tick").setRequired(false).setMinValue(Config.pa.tick.start).setMaxValue(Config.pa.tick.end))
    ,async execute(interaction) {
        let _tick = interaction.options.getInteger("tick");
        let _reply = await Spells.tick({tick: _tick});
        await interaction.reply({ embeds: [{ color: 0x7f7b81, description: _reply }] });
    }
};



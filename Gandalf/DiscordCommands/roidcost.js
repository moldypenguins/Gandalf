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
        .setName("roidcost")
        .setDescription("Calculate how long it will take to repay a value loss capping roids.")
        .addIntegerOption(o => o.setName("roids").setDescription("roids").setRequired(true).setMinValue(1))
        .addStringOption(o => o.setName("cost").setDescription("cost").setRequired(true))
        .addIntegerOption(o => o.setName("bonus").setDescription("bonus").setRequired(false)),
    async execute(interaction) {
        let _roids = interaction.options.getInteger("roids");
        let _cost = numeral(interaction.options.getString("cost")).value();
        let _bonus = interaction.options.getInteger("bonus") === null ? 0 : numeral(interaction.options.getInteger("bonus")).value();
        let _reply = await executeCommand({roids: _roids, cost: _cost, bonus: _bonus});
        await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
};



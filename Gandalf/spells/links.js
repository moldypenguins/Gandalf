/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High
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
 * @name links.js
 * @version 2022/11/17
 * @summary Gandalf Spells
 **/
'use strict';

import { NODE_CONFIG_DIR, SUPPRESS_NO_CONFIG_WARNING } from '../env.js';
import Config from 'config';
import { Mordor, Tick } from 'Mordor';

import { Context } from 'telegraf';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";

import { encode } from 'html-entities';
import numeral from 'numeral';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


export const telegram = {
  usage: encode('/ship <ship>'),
  description: 'Returns the stats of the specified ship.',
  cast: (args) => {
    return new Promise(async (resolve, reject) => {
      resolve(`<a href="${Config.web.uri}">${Config.alliance.name}</a>\n<a href="${Config.pa.links.game}">Planetarion</a>`);
    });
  }
};

export const discord = {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Shows links.'),
  async execute(interaction) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setURL(Config.web.uri)
          .setLabel(Config.alliance.name)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setURL(Config.pa.links.game)
          .setLabel('Planetarion')
          .setStyle(ButtonStyle.Link),
      );
    await interaction.reply({ components: [row] });
  },
  help: encode('/links')
};

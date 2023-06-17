'use strict';
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
 * @name parse.js
 * @version 2023/02/04
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from "sauron";
import { Mordor, Tick, Scan } from 'mordor';
import Access from '../access.js';

import { Context } from 'telegraf';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";

import { encode } from 'html-entities';
import numeral from 'numeral';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


const parse = {
  access: Access.Scanner,
  alias: null,
  usage: encode('/parse [param1] [param2]'),
  description: 'Parse scan link.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('parse')
      .setDescription('Lorem ipsum.')
      .addIntegerOption(o => o.setName('param1').setDescription('param1').setRequired(false).setMinValue(0).setMaxValue(100))
      .addStringOption(o => o.setName('param2').setDescription('param2').setRequired(false)),
    async execute(interaction) {
      let _p1 = interaction.options.getString('param1');
      let _reply = await executeCommand({link: _p1});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _link = args[0];
        let _reply = await executeCommand({link: _link});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;
  if(!params.link) {
    //param validation
    reply = "error";
  }
  else {
    let _parsed = Scan.parse(params.link);
    if (!_parsed) {
      reply = `Cannot parse scan.`;
    } else {



      reply = `Example`;
    }
  }
  return reply;
}

export default parse;

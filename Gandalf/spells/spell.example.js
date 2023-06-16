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
 * @name spell.example.js
 * @version 2023/01/22
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from "sauron";
import { Mordor, Tick } from 'mordor';
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


const spellname = {
  access: Access.Member,
  alias: ['spelln'],
  usage: encode('/spellname [param1] [param2]'),
  description: 'Lorem ipsum.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('spellname')
      .setDescription('Lorem ipsum.')
      .addIntegerOption(o => o.setName('param1').setDescription('param1').setRequired(false).setMinValue(0).setMaxValue(100))
      .addStringOption(o => o.setName('param2').setDescription('param2').setRequired(false)),
    async execute(interaction) {
      let _p1 = interaction.options.getInteger('param1');
      let _p2 = interaction.options.getString('param2');
      let _reply = await executeCommand({param1: _p1, param2: _p2});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _p1 = args[0];
        let _p2 = args[1];
        let _reply = await executeCommand({param1: _p1, param2: _p2});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;
  if(params.param1 || params.param2) {
    //param validation

  }
  let tick = await Tick.findLastTick();
  if(!tick) {
    reply = `Cannot find current tick.`;
  }
  else {
    reply = `Example`;
  }
  return reply;
}

export default spellname;

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
 * @name asshats.js
 * @version 2023/02/04
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import { Mordor, Tick, HeroPower } from 'mordor';
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


const asshats = {
  access: Access.Member,
  alias: null,
  usage: encode('/asshats'),
  description: 'Shows 5 biggest Asshats!.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('asshats')
      .setDescription('Shows 5 biggest Asshats!.'),
    async execute(interaction) {
      let _reply = await executeCommand();
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _reply = await executeCommand();
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;

  let tick = await Tick.findLastTick();
  if (!tick) {
    reply = `Cannot find current tick.`;
  } else {
    let powers = await HeroPower.find({
      tick: tick
    }).sort({rank: -1}).limit(5);
    if(!powers) {
      reply = "No powers were found."
    }
    else {
      reply = "Biggest 5 Asshats:\n";
      //console.log(`POWER: ${util.inspect(power, true, null, true)}`);
      let _powers = powers.map((hp) => {return `${hp.rank}: ${hp.member.pa_nick}`;});
      reply += _powers.join('\n');
    }
  }

  return reply;
}

export default asshats;

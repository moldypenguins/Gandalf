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
 * @name power.js
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


const power = {
  access: Access.Member,
  alias: null,
  usage: encode('/power'),
  description: 'Shows your Hero Power!.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('power')
      .setDescription('Shows your Hero Power!.'),
    async execute(interaction) {
      let _reply = await executeCommand();
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _reply = await executeCommand({user: ctx.user});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;
  if(!params.user) {
    //param validation
    reply = "error";
  }
  let tick = await Tick.findLastTick();
  if(!tick) {
    reply = `Cannot find current tick.`;
  }
  else {
    let power = await HeroPower.findOne({
      tick: tick,
      member: params.user
    });
    if(power) {
      reply = `Your power is ${power.size} strong. Rank: ${power.rank} of ${power.members}`;
    }
  }
  return reply;
}

export default power;

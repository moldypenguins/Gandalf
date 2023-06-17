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
 * @name roidcost.js
 * @version 2023/01/25
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

const roidcost = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/roidcost <roids> <value_cost> [pop_mining_bonus]'),
  description: 'Calculate how long it will take to repay a value loss capping roids.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('roidcost')
      .setDescription('Calculate how long it will take to repay a value loss capping roids.')
      .addIntegerOption(o => o.setName('roids').setDescription('roids').setRequired(true).setMinValue(1))
      .addStringOption(o => o.setName('cost').setDescription('cost').setRequired(true))
      .addIntegerOption(o => o.setName('bonus').setDescription('bonus').setRequired(false)),
    async execute(interaction) {
      let _roids = interaction.options.getInteger('roids');
      let _cost = numeral(interaction.options.getString('cost')).value();
      let _bonus = interaction.options.getInteger('bonus') === null ? 0 : numeral(interaction.options.getInteger('bonus')).value();
      let _reply = await executeCommand({roids: _roids, cost: _cost, bonus: _bonus});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _roids = numeral(args[0]).value();
        let _cost = numeral(args[1]).value();
        let _bonus = args.length === 3 ? numeral(args[2]).value() : numeral(0).value();
        let _reply = await executeCommand({roids: _roids, cost: _cost, bonus: _bonus});
        resolve(_reply);
      });
    }
  }
};

async function executeCommand(params) {
  let reply;
  if (!params.roids || !params.cost) {
    reply = `Usage: ${roidcost.usage}`;
  } else {
    let mining = Config.pa.roids.mining;
    mining = mining * ((params.bonus + 100) / 100);
    console.log(`roids: ${params.roids}`);
    console.log(`cost: ${params.cost}`);
    console.log(`bonus: ${params.bonus}`);
    console.log(`mining: ${mining}`);
    let ticks = (params.cost * Config.pa.numbers.ship_value) / (params.roids * mining);
    console.log(`ticks: ${ticks}`);
    reply = `Capping ${params.roids} roids at ${params.cost} value with ${params.bonus} bonus will repay in ${ticks} ticks (${Math.trunc(ticks / 24)} days)`;
    for (let gov in Config.pa.governments) {
      let bonus = Config.pa.governments[gov].prodcost;
      if (bonus === 0) continue;
      let ticks_b = ticks * (1 + bonus);
      reply += ` - ${Config.pa.governments[gov].name}: ${ticks_b} ticks (${Math.trunc(ticks_b/24)} days)`      
    }
  }
  return reply;
}

export default roidcost;

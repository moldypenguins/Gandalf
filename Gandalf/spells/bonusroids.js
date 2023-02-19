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
 * @name bonusroids.js
 * @version 2023/01/25
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'Galadriel/src/galadriel.ts';
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

const bonusroids = {
  access: Access.Member,
  alias: ['broids'],
  usage: encode('/bonusroids || /broids [tick=NOW] [pop_mining_bonus=0]'),
  description: 'Calculates how many ticks you need to keep the bonus roids to be worth it vs accepting resources.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('bonusroids')
      .setDescription('Calculates how many ticks you need to keep the bonus roids to be worth it vs accepting resources.')
      .addIntegerOption(o => o.setName('tick').setDescription('Tick').setRequired(false).setMinValue(0))
      .addIntegerOption(o => o.setName('popbonus').setDescription('Previous rounds bonus').setRequired(false).setMinValue(0).setMaxValue(10)),
    async execute(interaction) {
      let _tick = interaction.options.getInteger('tick');
      let _popbonus = interaction.options.getInteger('popbonus');
      let _reply = await executeCommand({tick: _tick, popbonus: _popbonus});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _tick = numeral(args[0]).value();
        let _popbonus = numeral(args[1]).value();
        let _reply = await executeCommand({tick: _tick, popbonus: _popbonus});
        resolve(_reply);
      });
    }
  }
};

async function executeCommand(params) {
  let reply;
  let tick = params.tick;
  let bonus = params.popbonus > 0 ? params.popbonus / 100 : 0;
  let nowtick = await Tick.findLastTick();
  if(!nowtick) {
    reply = `Cannot find current tick.`;
  }
  else {
    if (!tick || tick == 0 || tick == null) {
      tick = nowtick.tick;
    }
    
    let resource_bonus = 10000 + (tick * 4800);
    let roids = Math.trunc(6 + (tick * 0.15));
    let mining = Config.pa.roids.mining;
    let mining_bonus = mining * (1 + bonus);
    
    reply = `Resource Bonus at tick ${tick}: ${resource_bonus}\nRoid bonus at tick ${tick}: ${roids}\nResource mined per roid per tick: ${mining_bonus}\n`;
    let ticks = resource_bonus / (roids * mining_bonus);
    reply += `Would take ${Math.ceil(ticks)} ticks (${Math.trunc(ticks / 24)} days) to produce ${resource_bonus} of each mineral`
    
  }  
  
  return reply;
}

export default bonusroids;

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
 * @name bonus.js
 * @version 2023/01/22
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

const bonus = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/bonus [tick=NOW] [prev-round-bonus=0]'),
  description: 'Calculates upgrade bonus at specified tick. Check PA upgrade bonus page for prev round bonus %.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('bonus')
      .setDescription('Calculates upgrade bonus at specified tick. Check PA upgrade bonus page for prev round bonus %.')
      .addIntegerOption(o => o.setName('tick').setDescription('Tick').setRequired(false).setMinValue(0))
      .addIntegerOption(o => o.setName('prbonus').setDescription('Previous rounds bonus').setRequired(false).setMinValue(0).setMaxValue(10)),
    async execute(interaction) {
      let _tick = interaction.options.getInteger('tick');
      let _prbonus = interaction.options.getInteger('prbonus');
      let _reply = await executeCommand({tick: _tick, prbonus: _prbonus});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _tick = numeral(args[0]).value();
        let _prbonus = numeral(args[1]).value();
        let _reply = await executeCommand({tick: _tick, prbonus: _prbonus});
        resolve(_reply);
      });
    }
  }
};

async function executeCommand(params) {
  let reply;
  let tick = params.tick;
  let bonus = 1.0 + (params.prbonus / 100);
  let nowtick = await Tick.findLastTick();
  if(!nowtick) {
    reply = `Cannot find current tick.`;
  }
  else {
    if (!tick || tick == 0 || tick == null) {
      tick = nowtick.tick;
    }

    let resource_bonus = 10000 + (tick * 4800);
    let roid_bonus = Math.trunc(6 + (tick * 0.15));
    let rp_bonus = Math.trunc((4000 + (tick * 24) * bonus));
    let cp_bonus = Math.trunc((2000 + (tick * 18) * bonus));  

    reply = `Upgrade Bonus calculation for tick: ${tick}\nResource Bonus: ${resource_bonus}\nRoid Bonus: ${roid_bonus}\nResearch Point Bonus: ${rp_bonus}\nConstruction Point Bonus: ${cp_bonus}`;
  }  
  
  return reply;
}

export default bonus;

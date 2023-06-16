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
 * @name prodtime.js
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


const prodtime = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/prodtime <total resources> <factories> <race> [govt] [pop bonus]'),
  description: 'Calculate ticks taken to produce ships costing &lt;total resources&gt; (assumes Soc & 60 pop if blank)',
  discord: {
    data: new SlashCommandBuilder()
      .setName('prodtime')
      .setDescription('Calculate ticks taken to produce ships costing <total resources> (assumes Soc & 60 pop if blank)')
      .addIntegerOption(o => o.setName('resources').setDescription('Total resources in production').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('factories').setDescription('No. factories').setRequired(true).setMinValue(0))
      .addStringOption(o => o.setName('race').setDescription('Race').setRequired(true))
      .addStringOption(o => o.setName('govt').setDescription('Government type').setRequired(false))
      .addIntegerOption(o => o.setName('pop_bonus').setDescription('Shipwrights pop bonus').setRequired(false).setMinValue(0)),
    async execute(interaction) {
      let _p1 = interaction.options.getInteger('resources');
      let _p2 = interaction.options.getInteger('factories');
      let _p3 = interaction.options.getString('race');
      let _p4 = interaction.options.getString('govt');
      let _p5 = interaction.options.getInteger('pop_bonus');
      let _reply = await executeCommand({resources: _p1, factories: _p2, race: _p3, govt: _p4, pop_bonus: _p5});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _p1 = numeral(args[0]).value();
        let _p2 = numeral(args[1]).value();
        let _p3 = args[2];
        let _p4 = args[3];
        let _p5 = args[4];
        let _reply = await executeCommand({resources: _p1, factories: _p2, race: _p3, govt: _p4, pop_bonus: _p5});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply, gov, xeno, assumed, racefound;
  
  if (params.resources == 0 || params.factories == 0 || params.race == undefined) {
    reply = `Usage: ${prodtime.usage}`
  } else {
    let resources = params.resources;
    let factories = params.factories;
    let race_bonus = 0;
    let gov_bonus = 0;
    let pop_bonus = params.pop_bonus;

    if (params.pop_bonus == undefined) {
      pop_bonus = 60;
      assumed = 1;
      console.log(`Max pop assumed!`);
    }
    console.log(`Pop bonus ${pop_bonus}`);

    let races = Config.pa.race;
    for (xeno in races) {
      let race = races[xeno];
      console.log(`Race ${JSON.stringify(race)}`);
      if (race.name.toLowerCase().startsWith(params.race.toLowerCase()) || race.name.toLowerCase().includes(params.race)) {
        race_bonus = race.prodtime * 100;
        console.log(`Race bonus found ${race_bonus}`)
        racefound = 1;
      }
    }
    if (!racefound) {
      reply = (`${params.race.charAt(0).toUpperCase() + params.race.slice(1)} is not a race.\n` + prodtime.usage);
    } else {
      
      if (params.govt == null || params.govt == undefined) {
        gov_bonus = 20;
        assumed++;
        console.log(`Socialism assumed! Gov bonus ${gov_bonus}`)
      }  else  {    
        let goverments = Config.pa.governments;
        for (gov in goverments) {
          let goverment = goverments[gov];
    //      console.log(`goverment ${JSON.stringify(goverment)}`);
          if (goverment.name.toLowerCase().startsWith(params.govt) || goverment.name.toLowerCase().includes(params.govt)) {
            gov_bonus = goverment.prodtime * 100;
            console.log(`found ${gov_bonus}`)
          }
        }
      }
      
      let pu_needed = (resources ** 0.5) * (Math.log(resources ** 2));
      console.log (`PU needed ${pu_needed}`);
      
      let pu_output = Math.round(((4000 * factories) ** 0.98) * (1 + (pop_bonus + gov_bonus + race_bonus) / 100));
      let pu_output_min = Math.round(((4000 * factories) ** 0.98) * (1 + (0 + -20 + race_bonus) / 100));
      let pu_output_max = Math.round(((4000 * factories) ** 0.98) * (1 + (60 + 20 + race_bonus) / 100));
      console.log (`PU output/tick ${pu_output}`);
      console.log (`Min PU output ${pu_output_min}`);
      console.log (`Max PU output ${pu_output_max}`);
      
      let prod_time = Math.round((pu_needed + (10000 * factories)) / pu_output);
      let prod_time_long = Math.round((pu_needed + (10000 * factories)) / pu_output_min);
      let prod_time_short = Math.round((pu_needed + (10000 * factories)) / pu_output_max);
      console.log (`Prod time ${prod_time} ticks`);
      console.log (`Min prod time ${prod_time_short} ticks`);
      console.log (`Max prod time ${prod_time_long} ticks`);
      
      reply = `Production time for ${resources} worth of ships in ${factories} factories: ${prod_time} ticks\n`;
      if (!assumed || assumed != 2) {
        reply += `Shortest possible prod time (Socialism & 60 pop): ${prod_time_short} ticks\n`;
      }
      reply += `Longest possible prod time (Anarchy & 0 pop): ${prod_time_long} ticks\n`;    

    }   
  }
  return reply;
}


export default prodtime;

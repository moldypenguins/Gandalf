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
 * @name exile.js
 * @version 2023/01/25
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import { Mordor, Tick, Galaxy } from 'mordor';
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


const exile = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/exile'),
  description: 'Shows information regarding chances of landing in desired galaxies.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('exile')
      .setDescription('Shows information regarding chances of landing in desired galaxies.'),
    async execute(interaction) {
      let _reply = await executeCommand({});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _reply = await executeCommand({});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand() {
  let reply;

  let galaxy_count = await Galaxy.countDocuments({active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}]});
  //console.log(`galaxy_count: ${galaxy_count}`);
  let galaxy_limit = Math.trunc(galaxy_count * 0.2);
  //console.log(`galaxy_limit: ${galaxy_limit}`);

  let galaxy_groups = await Galaxy.aggregate([
    {$match: {active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}]}},
    {$sort: {planets: 1}},
    {$limit: galaxy_limit},
    {$group: {_id: '$planets', galaxies: {$sum: 1}}}
  ]).sort({_id: 1});
  //console.log('GALAXY_GROUPS: ' + util.inspect(galaxy_groups.length, false, null, true));

  reply = `Exile Bracket: ${galaxy_limit} of ${galaxy_count} galaxies.`;
  for(let g in galaxy_groups) {
    if(g < galaxy_groups.length - 1) {
      reply += `\n${galaxy_groups[g].galaxies} ${galaxy_groups[g].galaxies > 1 ? 'galaxies' : 'galaxy'} with ${galaxy_groups[g]._id} planets`;
      let coords = [];
      let planet_gals = await Galaxy.find({active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}], planets: {$eq: galaxy_groups[g]._id}});
      for(let p in planet_gals) {
        coords.push(`${planet_gals[p].x}:${planet_gals[p].y}`);
      }
      reply += ` (${coords.join(', ')})`;
    } else {
      let max_planet_gal_count = await Galaxy.countDocuments({active: true, $and:[{x: {$ne: 200}},{$or: [{x: {$ne: 1}},{y: {$ne: 1}}]}], planets: {$eq: galaxy_groups[g]._id}});
      reply += `\n${galaxy_groups[g].galaxies} out of ${max_planet_gal_count} galaxies with ${galaxy_groups[g]._id} planets`;
    }
    //console.log('GALAXY_GROUP: ' + util.inspect(galaxy_groups[g], false, null, true));
  }
  
  return reply;
 
}

export default exile;

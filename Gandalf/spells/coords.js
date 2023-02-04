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
 * @name spell.js
 * @version 2023/02/04
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import { Mordor, Tick, User, Planet } from 'mordor';
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


const coords = {
  access: Access.Member,
  alias: null,
  usage: encode('/coords <x:y:z>'),
  description: 'Set your member planet.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('coords')
      .setDescription('Set your member planet.')
      .addStringOption(o => o.setName('coords').setDescription('coords').setRequired(true)),
    async execute(interaction) {
      let _coords = interaction.options.getString('coords');
      let _reply = await executeCommand({coords: _coords});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _coords = args[0];
        console.log(`COORDS: ${util.inspect(_coords, true, null, true)}`)
        let _reply = await executeCommand({user: ctx.user, coords: _coords});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;
  if(!params.user || !params.coords) {
    //param validation
    reply = "error";
  }
  else {
    let _user = await User.findById(params.user._id);
    if (!_user) {
      reply = `Cannot find user.`;
    } else {
      console.log(`COORDS: ${util.inspect(params.coords, true, null, true)}`)

      let _coords = params.coords.split(':')



      let p = await Planet.findOne({x: _coords[0], y: _coords[1], z: _coords[2]})
      if(!p) {
        reply = "Cannot find planet.";
      }
      else if(_user.planet) {
        reply = "Planet is already set.";
      }
      else {
        _user.planet = p;
        _user.save();
        reply = `Added planet ${p.planet_id} to ${_user.pa_nick}`;
      }
    }
  }
  return reply;
}

export default coords;

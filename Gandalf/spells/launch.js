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
 * @name launch.js
 * @version 2023/01/22
 * @summary Gandalf Spells
 **/


import Config from 'galadriel';
import { Mordor, Tick } from 'mordor';

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


const launch = {
  access: null,
  usage: encode('/launch <class|eta> <LT> [timezone]'),
  description: 'Calculates when ships should be launched to land at LT.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('launch')
      .setDescription('Calculates when ships should be launched to land at LT.')
      .addIntegerOption(o => o.setName('eta').setDescription('eta').setRequired(false).setMinValue(8).setMaxValue(14))
      .addIntegerOption(o => o.setName('lt').setDescription('lt').setRequired(false).setMinValue(Config.pa.tick.start).setMaxValue(Config.pa.tick.end))
      .addStringOption(o => o.setName('timezone').setDescription('timezone').setRequired(false)),
    async execute(interaction) {
      let _eta = interaction.options.getInteger('eta');
      let _lt = interaction.options.getInteger('lt');
      let _tzone = interaction.options.getString('timezone');

      let reply = await executeCommand({eta: _eta, lt: _lt, tz: _tzone});
      await interaction.reply(reply);

    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        if (!Array.isArray(args) || args.length < 2) {
          reject('invalid number of arguments.');
        } else {
          let _eta = numeral(args[0]).value();
          if (_eta == null) {
            reject(`ETA must be a valid number.`);
          }
          let _lt = args[1];
          _lt = numeral(_lt).value();
          if (_lt == null) {
            reject(`LT must be a valid number.`);
          }
          let reply = executeCommand({eta: _eta, lt: _lt, tz: args[2]});
          resolve(reply);
        }
      });
    }
  }
};

async function executeCommand(params) {
  let reply;
  if(params.eta || params.lt) {
    //param validation
    //var spacing = options.spacing || 0;
    //var width = options.width || "50%";
  }
  let now_tick = await Tick.findLastTick();
  let now_time = dayjs(now_tick.timestamp).utc();
  let _timezone = 'UTC';
  if (params.tz) {
    try {
      now_time.tz(params.tz);
      _timezone = params.tz;
    } catch (err) {
      _timezone = undefined;
    }
  }

  if (!_timezone) {
    reply = `invalid timezone: ${params.tz}`;
  } else {
    let current_time = dayjs().utc();
    let launch_tick = params.lt - params.eta;
    let launch_time = current_time.add(launch_tick - now_tick.tick, 'hours');
    let prelaunch_tick = params.lt - params.eta + 1;
    let prelaunch_mod = launch_tick - now_tick.tick;
    reply = `eta ${params.eta} landing pt ${params.lt} (currently ${now_tick.tick}) must launch at pt ${launch_tick} (${launch_time.tz(_timezone).format('YYYY-MM-DD H:55 z')}), or with prelaunch tick ${prelaunch_tick} (currently +${prelaunch_mod})`;
  }
  return reply;
}

export default launch

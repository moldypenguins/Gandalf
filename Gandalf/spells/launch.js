/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High
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
 * @version 2022/11/17
 * @summary Gandalf Spells
 **/
'use strict';


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


export const telegram = {
  usage: encode('/launch <class|eta> <LT>'),
  description: 'Calculates when ships should be launched to land at LT.',
  cast: (ctx, args) => {
    return new Promise(async (resolve, reject) => {
      if(!Array.isArray(args) || args.length < 2) {
        reject('invalid number of arguments.');
      }
      else {
        let eta = numeral(args[0]).value();
        if (eta == null) { reject(`ETA must be a valid number.`); }
        let _lt = args[1];
        let lt = numeral(_lt).value();
        if (lt == null) { reject(`LT must be a valid number.`); }

        let now_tick = await Tick.findLastTick();
        let now_time = dayjs(now_tick.timestamp).utc();
        let _timezone = 'UTC';
        if(args.length > 2) {
          try {
            now_time.tz(args[2]);
            _timezone = args[2];
          }
          catch(err) {
            _timezone = undefined;
          }
        }

        if(!_timezone) {
          reject(`invalid timezone: ${args[2]}`);
        }
        else {
          let current_time = dayjs().utc();
          let launch_tick = lt - eta;
          let launch_time = current_time.add(launch_tick - now_tick.tick, 'hours');
          let prelaunch_tick = lt - eta + 1;
          let prelaunch_mod = launch_tick - now_tick.tick;
          let reply = `eta ${eta} landing pt ${lt} (currently ${now_tick.tick}) must launch at pt ${launch_tick} (${launch_time.tz(_timezone).format('YYYY-MM-DD H:55 z')}), or with prelaunch tick ${prelaunch_tick} (currently +${prelaunch_mod})`;
          resolve(reply);
        }
      }
    });
  }
};

export const discord = {
  data: new SlashCommandBuilder()
    .setName('tick')
    .setDescription('Shows when the given tick will happen.')
    .addIntegerOption(o => o.setName('tick').setDescription('tick').setRequired(false).setMinValue(Config.pa.tick.start).setMaxValue(Config.pa.tick.end))
    .addStringOption(o => o.setName('timezone').setDescription('timezone').setRequired(false)),
  async execute(interaction) {
    let _tick = interaction.options.getInteger('tick');
    let _tzone = interaction.options.getString('timezone');
    let tick = await Tick.findLastTick();
    if(!tick) {
      await interaction.reply(`Cannot find current tick.`);
    }
    else {
      let reply;
      if(!_tick || tick.tick === _tick) {
        reply = `It is currently tick ${tick.tick}`;
      }
      else {
        reply = `Tick ${_tick} is expected to happen in ${_tick-tick.tick} ticks`;
      }
      let ticktime = dayjs(tick.timestamp);
      if(_tzone) {
        reply += `(${ticktime.tz(_tzone)})`
      }
      else {
        reply += `(${ticktime.tz()})`;
      }
      await interaction.reply(reply);
    }
  },
  help: encode('/tick [tick] [timezone]')
};

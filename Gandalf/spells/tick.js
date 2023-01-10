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
 * @name tick.js
 * @version 2022/11/17
 * @summary Gandalf Spells
 **/
'use strict';

import Config from 'galadriel';
import { Mordor, Tick } from 'mordor';

import { Context } from 'telegraf';
import { SlashCommandBuilder } from "discord.js";

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
  usage: encode('/tick [tick=NOW] [timezone=UTC]'),
  description: 'Calculates when a tick will occur.',
  cast: (ctx, args) => {
    return new Promise(async (resolve, reject) => {
      let now_tick = await Tick.findLastTick();
      let _tick = numeral(args.length > 0 ? args[0] : now_tick.tick).value();
      if(_tick == null) {
        reject(`tick provided must be a number`);
      }
      else {
        let now_time = dayjs(now_tick.timestamp).utc();
        let _timezone = 'UTC';
        if(args.length > 1) {
          try {
            now_time.tz(args[1]);
            _timezone = args[1];
          }
          catch(err) {
            _timezone = undefined;
          }
        }

        if(!_timezone) {
          reject(`invalid timezone: ${args[1]}`);
        }
        else {
          let reply;
          if(now_tick.tick === _tick) {
            reply = `It is currently tick <b>${now_tick.tick}</b> (<i>${now_time.tz(_timezone).format('YYYY-MM-DD H:mm z')}</i>)`;
          }
          else {
            now_time = now_time.add(_tick - now_tick.tick, 'hour');
            if(_tick > now_tick.tick) {
              reply = `Tick <b>${_tick}</b> will happen in ${_tick - now_tick.tick} ticks (<i>${now_time.tz(_timezone).format('YYYY-MM-DD H:mm z')}</i>)`;
            }
            else {
              reply = `Tick <b>${_tick}</b> happened ${now_tick.tick - _tick} ticks ago (<i>${now_time.tz(_timezone).format('YYYY-MM-DD H:mm z')}</i>)`;
            }
          }
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
        if(_tick > tick.tick) {
          reply = `Tick ${_tick} is expected to happen in ${_tick - tick.tick} ticks`;
        }
        else {
          reply = `Tick ${_tick} happened ${tick.tick - _tick} ticks ago`;
        }
      }
      let ticktime = dayjs(tick.timestamp);
      if(_tzone) {
        reply += ` (${ticktime.tz(_tzone).format('YYYY-MM-DD H:mm z')})`
      }
      else {
        reply += ` (${ticktime.tz().format('YYYY-MM-DD H:mm z')})`;
      }
      await interaction.reply(reply);
    }
  },
  help: encode('/tick [tick] [timezone]')
};

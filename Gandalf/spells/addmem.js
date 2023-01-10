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
 * @name addmem.js
 * @version 2022/11/22
 * @summary Gandalf Spells
 **/
'use strict';

import Config from 'galadriel';
import {Mordor, Member, TelegramUser, Tick} from 'mordor';

import { Context } from 'telegraf';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";

import { encode } from 'html-entities';
import numeral from 'numeral';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import util from "util";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


export const telegram = {
  usage: encode('/addmem <user> [panick]'),
  description: 'Adds a member',
  cast: (ctx, args) => {
    return new Promise(async (resolve, reject) => {
      if(!Array.isArray(args) || args.length < 5) {
        reject('invalid number of arguments.');
      }
      else {
        let _user = ctx.message.entities && ctx.message.entities[1]?.type === 'mention' ? null : null;
        if(_user?.length <= 0) { reject(`User must be a Telegram user.`); }
        let _nick = args[1];
        if (_nick?.length <= 0) { reject(`PA nick must be a valid string.`); }

        console.log(util.inspect(ctx.message.entities, true, null, true));

        let tguser = await TelegramUser.exists({tg_id: 4});
        if(!tguser) {
          reject(`invalid user: ${args[1]}`);
        } else {

          let member = await new Member({
              _id: Mordor.Types.ObjectId(),
              pa_nick: _nick,
              tg_user: tguser,
              parent: ctx.member
            }).save();
          console.log(`Error: ${util.inspect(member, true, null, true)}`);
          if(member) {
            resolve(`${member.pa_nick} has been added.`);
            //ctx.replyWithHTML(`Member added`);
          } else {
            reject(`Error: try again`);
            //ctx.replyWithHTML(`Error: try again`);
          }
        }
      }
    });
  }
};



export const discord = {
  data: new SlashCommandBuilder()
    .setName('adduser')
    .setDescription('adds a user'),
  async execute(interaction) {
    await interaction.reply();
  },
  help: encode('/adduser <user>')
};

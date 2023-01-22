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
 * @name addmember.js
 * @version 2023/01/21
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import {Mordor, Member, TelegramUser, Tick} from 'mordor';
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



const addmember = {
  access: Access.Admin,
  usage: encode('/addmember <user> <panick> [access=0]'),
  description: 'Adds a member',
  discord: {
    data: new SlashCommandBuilder()
      .setName('addmember')
      .setDescription('adds a member'),
    async execute(interaction) {
      await interaction.reply();
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        if(!Array.isArray(args) || args.length < 2) {
          reject('invalid number of arguments.');
        }
        else {
          let _user = ctx.message.entities && ctx.message.entities[1]?.type === 'mention' ? null : null;
          if(_user?.length <= 0) { reject(`User must be a Telegram user.`); }
          let _nick = args[1];
          if (_nick?.length <= 0) { reject(`PA nick must be a valid string.`); }
          let _access = args[2] | 0;

          console.log('HERE' + util.inspect(ctx, true, null, true));

          let tguser = await TelegramUser.exists({tguser_id: 4});
          if(!tguser) {
            reject(`Invalid telegram user: ${args[1]}\nThey should use the \/start command`);
          } else {

            let member = new Member({
              _id: Mordor.Types.ObjectId(),
              pa_nick: _nick,
              tg_user: tguser,
              parent: ctx.member
            })
            await member.save();
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
  }
}

async function executeCommand(params) {

}

export default addmember

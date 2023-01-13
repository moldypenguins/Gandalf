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
 * @name ship.js
 * @version 2022/11/17
 * @summary Gandalf Spells
 **/
'use strict';

import Config from 'galadriel';
import { Mordor, Tick, Ship } from 'mordor';

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
  usage: encode('/ship <ship>'),
  description: 'Returns the stats of the specified ship.',
  cast: (ctx, args) => {
    return new Promise(function(resolve, reject) {
      if (!Array.isArray(args) || args.length < 1) { reject(Ships_ship_usage); }
      let _ship = args[0];
      //console.log(`ARGS: ship=${_ship}`);

      Ship.find().then((ships) => {
        //console.log(ships);
        let ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
        if(!ship) {
          reject(`Cannot find ship ${_ship}`);
        } else {
          let reply = `${ship.name} (${ship.race}) is class ${ship.class} | Target 1: ${ship.target1}`;
          if(ship.target2 != '-') {
            reply += ` | Target 2: ${ship.target2}`;
          }
          if(ship.target3 != '-') {
            reply += ` | Target 3: ${ship.target3}`;
          }
          reply += ` | Type: ${ship.type} | Init: ${ship.initiative}`;
          reply += ` | EMPres: ${ship.empres}`;

          if(ship.type.toLowerCase() == 'emp') {
            reply += ` | Guns: ${ship.guns}`;
          } else {
            reply += ` | D/C: ${Math.trunc(Number(ship.damage)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
          }
          reply += ` | A/C: ${Math.trunc(Number(ship.armor)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
          resolve(reply);
        }
      }).catch((err) => { reject(err); });
    });
  }
};


export const discord = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Shows the stats of the specified ship.')
    .addStringOption(o => o.setName('ship').setDescription('ship').setRequired(true)),
  async execute(interaction) {
    let _ship = interaction.options.getString('ship');
    let ship = await Ship.findOne({ name: { $regex: '^' + _ship, $options: 'i'} });
    if(!ship) {
      await interaction.reply(`Cannot find ship ${_ship}`);
    }
    else {
      console.log(`SHIP: ${ship}`);
      let reply = `${ship.name} (${ship.race})\nClass: ${ship.class}\nTarget 1: ${ship.target1}`;
      if(ship.target2 !== '-') {
        reply += `\nTarget 2: ${ship.target2}`;
      }
      if(ship.target3 !== '-') {
        reply += `\nTarget 3: ${ship.target3}`;
      }
      reply += `\nType: ${ship.type}\nInit: ${ship.initiative}`;
      reply += `\nEMP Res: ${ship.empres}`;
      if(ship.type.toLowerCase() === 'emp') {
        reply += `\nGuns: ${ship.guns}`;
      }
      reply += `\nD/C: ${Math.trunc(Number(ship.damage)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
      reply += `\nA/C: ${Math.trunc(Number(ship.armor)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
      await interaction.reply(`\`\`\`${reply}\`\`\``);
    }
  },
  help: encode('/ship <ship>')
};

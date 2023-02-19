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
 * @name ship.js
 * @version 2023/01/22
 * @summary Gandalf Spells
 **/


import Config from 'Galadriel/src/galadriel.ts';
import { Mordor, Tick, Ship } from 'mordor';

import { Context } from 'telegraf';
import { SlashCommandBuilder } from "discord.js";

import { encode } from 'html-entities';
import numeral from 'numeral';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import tick from "./tick.js";
import util from "util";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


let ship = {
  access: null,
  usage: encode('/ship <ship>'),
  description: 'Returns the stats of the specified ship.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('ship')
      .setDescription('Shows the stats of the specified ship.')
      .addStringOption(o => o.setName('ship').setDescription('ship').setRequired(true)),
    async execute(interaction) {
      let _ship = interaction.options.getString('ship');
      let reply = await executeCommand({ship: _ship});
      await interaction.reply(`\`\`\`${reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(function (resolve, reject) {
        if (!Array.isArray(args) || args.length < 1) {
          reject('Invalid number of arguments.');
        }
        else {
          let _ship = args[0];
          //console.log(`ARGS: ship=${_ship}`);

          let reply = executeCommand({ship: _ship});
          resolve(reply);
        }
      });
    }
  }
};


async function executeCommand(params) {
  let reply;
  if(params.ship) {
    //param validation
    //var spacing = options.spacing || 0;
    //var width = options.width || "50%";
  }

  console.log(`PARAM: ${util.inspect(params.ship, true, null, true)}`)

  let _ship = await Ship.findOne({$where: () => {this.name.toLowerCase().startsWith(params.ship.toLowerCase())}});

  console.log(`SHIP: ${util.inspect(_ship, true, null, true)}`)

  if(!_ship) {
    reply = 'Ship not found.';
  }
  else {
    reply = `${_ship.name} (${_ship.race})\nClass: ${_ship.class}\nTarget 1: ${_ship.target1}`;
    if(_ship.target2 !== '-') {
      reply += `\nTarget 2: ${_ship.target2}`;
    }
    if(_ship.target3 !== '-') {
      reply += `\nTarget 3: ${_ship.target3}`;
    }
    reply += `\nType: ${_ship.type}\nInit: ${_ship.initiative}`;
    reply += `\nEMP Res: ${_ship.empres}`;
    if(_ship.type.toLowerCase() === 'emp') {
      reply += `\nGuns: ${_ship.guns}`;
    }
    reply += `\nD/C: ${Math.trunc(Number(_ship.damage)*10000/(Number(_ship.metal) + Number(_ship.crystal) + Number(_ship.eonium)))}`;
    reply += `\nA/C: ${Math.trunc(Number(_ship.armor)*10000/(Number(_ship.metal) + Number(_ship.crystal) + Number(_ship.eonium)))}`;
  }
  return reply;
}

export default ship;

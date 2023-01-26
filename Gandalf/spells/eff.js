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
 * @name eff.js
 * @version 2023/01/25
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import { Mordor, Tick, Ship } from 'mordor';
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


const eff = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/eff <number> <ship>'),
  description: 'Calculates the efficiency of the specified number of ships.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('eff')
      .setDescription('Calculates the efficiency of the specified number of ships.')
      .addStringOption(o => o.setName('number').setDescription('number').setRequired(true))
      .addStringOption(o => o.setName('ship').setDescription('ship').setRequired(true)),
    async execute(interaction) {
      let _number = numeral(interaction.options.getString('number')).value();
      let _ship = interaction.options.getString('ship');
      let _reply = await executeCommand({number: _number, ship: _ship});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _number = numeral(args[0]).value();
        let _ship = args[1];
        let _reply = await executeCommand({number: _number, ship: _ship});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply;
  if(!params.number || !params.ship) {
    reply = `Usage: ${eff.usage}`;
  } else {
    let ship = await Ship.findOne({$where:`this.name.toLowerCase().startsWith("${params.ship}")`});
    let number = params.number;
    if(!ship) {
      reply = `Cannot find ship ${_ship}`;
    } else {
      let damage = ship.damage !== '-' ? numeral(ship.damage).value() * number : 0
      reply = `${numeral(number).format('0,0')} ${ship.name} (${numeral(number * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / Config.pa.numbers.ship_value).format('0a') })`;

      switch (ship.type.toLowerCase()) {
        case 'pod':
          reply += ` will capture ${numeral(damage / 50).format('0,0')} roids`;
          break;
        case 'structure':
          reply += ` will destroy ${numeral(damage / 50).format('0,0')} structures`;
          break;
        default:
          reply += ` will ${Config.pa.ships.damagetypes[ship.type.toLowerCase()]}:\n`;
          for(let t in Config.pa.ships.targets) {
            let target = Config.pa.ships.targets[t];
            //console.log("TARGET: " + util.inspect(target, false, null, true));
            if (ship[target] !== '-') {
              reply += `${t}: ${ship[target]}s (${Config.pa.ships.targeteffs[target] * 100}%)\n`;
              let shiptargets = await Ship.find({class: ship[target]});
              //console.log("TARGETED SHIPS: " + util.inspect(shiptargets, false, null, true));
              if (shiptargets) {
                var results = shiptargets.map(function (shiptarget) {
                  switch (ship.type.toLowerCase()) {
                    case 'emp':
                      let empnumber = Math.trunc(Config.pa.ships.targeteffs[target] * ship.guns * number * (100 - shiptarget.empres) / 100);
                      return (`${numeral(empnumber).format('0,0')} ${shiptarget.name} (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format('0a')})`);
                      break;
                    default:
                      let targetnumber = Math.trunc(Config.pa.ships.targeteffs[target] * damage / shiptarget.armor);
                      return (`${numeral(targetnumber).format('0,0')} ${shiptarget.name} (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / Config.pa.numbers.ship_value).format('0a')})`);
                      break;
                  }
                });
                reply += results.join('; ') + `\n`;
              }
            }
          }
          break;
      }   
    }
  }
  return reply;
}

export default eff;

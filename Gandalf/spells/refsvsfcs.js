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
 * @name refsvsfcs.js
 * @version 2023/01/25
 * @summary Gandalf Spells
 **/

import util from 'util';
import Config from 'galadriel';
import { Mordor, Tick } from 'mordor';
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


const refsvsfcs = {
  access: Access.Member,
//  alias: ['spelln'],
  usage: encode('/refsvsfcs <roids> <metal ref #> <crystal ref #> <eonium ref #> <FC #> <gov type> <mining population> <cores level #>'),
  description: 'Calculates whether refineries or FCs will give a better return on investment by round end.',
  discord: {
    data: new SlashCommandBuilder()
      .setName('refsvsfcs')
      .setDescription('Calculates whether refineries or FCs will give a better return on investment by round end.')
      .addIntegerOption(o => o.setName('roids').setDescription('Total roids').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('metal_refs').setDescription('Metal refineries').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('crystal_refs').setDescription('Crystal refineries').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('eonium_refs').setDescription('Eonium refineries').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('fcs').setDescription('Finance Centres').setRequired(true).setMinValue(0))
      .addStringOption(o => o.setName('gov_type').setDescription('Government').setRequired(true))
      .addIntegerOption(o => o.setName('pop_bonus').setDescription('Mining pop bonus').setRequired(true).setMinValue(0))
      .addIntegerOption(o => o.setName('cores').setDescription('Cores research level').setRequired(true).setMinValue(0)),
    async execute(interaction) {
      let _p1 = interaction.options.getInteger('roids');
      let _p2 = interaction.options.getInteger('metal_refs');
      let _p3 = interaction.options.getInteger('crystal_refs');
      let _p4 = interaction.options.getInteger('eonium_refs');
      let _p5 = interaction.options.getInteger('fcs');
      let _p6 = interaction.options.getString('gov_type');
      let _p7 = interaction.options.getInteger('pop_bonus');
      let _p8 = interaction.options.getInteger('cores');
      let _reply = await executeCommand({roids: _p1, metal_refs: _p2, crystal_refs: _p3, eonium_refs: _p4, fcs: _p5, gov_type: _p6, pop_bonus: _p7, cores: _p8});
      await interaction.reply(`\`\`\`${_reply}\`\`\``);
    }
  },
  telegram: {
    async execute(ctx, args) {
      return new Promise(async (resolve, reject) => {
        let _p1 = numeral(args[0]).value();
        let _p2 = numeral(args[1]).value();
        let _p3 = numeral(args[2]).value();
        let _p4 = numeral(args[3]).value();
        let _p5 = numeral(args[4]).value();
        let _p6 = args[5];
        let _p7 = numeral(args[6]).value();
        let _p8 = numeral(args[7]).value();
        let _reply = await executeCommand({roids: _p1, metal_refs: _p2, crystal_refs: _p3, eonium_refs: _p4, fcs: _p5, gov_type: _p6, pop_bonus: _p7, cores: _p8});
        resolve(_reply);
      });
    }
  }
};



async function executeCommand(params) {
  let reply, gov, lvl, coreIncome;
  
  if (params.roids == 0 || params.gov_type == undefined) {
    reply = `Usage: ${refsvsfcs.usage}`
  } else {
    let roids = params.roids;
    let metal_ref = params.metal_refs;
    let crystal_ref = params.crystal_refs;
    let eon_ref = params.eonium_refs;
    let fc = params.fcs;
    let gov_bonus = 0; // params.gov_type
    let population = params.pop_bonus / 100;
    
    let cores = params.cores;
    let corelevels = Config.pa.cores;
    for (lvl in corelevels) {
//      console.log(lvl, corelevels[lvl]);
      if (cores == lvl) {
        coreIncome = corelevels[lvl];
//        console.log(`found core income ${coreIncome}`);        
      }
    }
    
    let goverments = Config.pa.governments;
    for (gov in goverments) {
      let goverment = goverments[gov];
//      console.log(`goverment ${JSON.stringify(goverment)}`);
      if (goverment.name.toLowerCase().startsWith(params.gov_type) || goverment.name.toLowerCase().includes(params.gov_type)) {
        gov_bonus = goverment.mining;
 //       console.log(`found ${gov_bonus}`)
      }
    }

//    console.log(`gov bonus: ${gov_bonus}`);

    let now = await Tick.findOne().sort({ tick: -1 }); 
//    console.log(`now.tick ${now.tick}`);
    let ticksLeft = 1177 - now.tick;//numeral(Config.pa.tick.end).value() - numeral(now.tick).value();
//    console.log(`ticks left ${ticksLeft}`);

    // Assume they will build the cheapest refinery next. This is always the most efficient thing to do for maxing income anyway.
    let lowestRef = Math.min(metal_ref, crystal_ref, eon_ref); 
    let baseRefCost = Config.pa.construction.baseRefCost;
    let baseFCCost = Config.pa.construction.baseFCCost;
    let fcBonus = Config.pa.construction.fcBonus;
    let roidIncome = Config.pa.roids.mining;
    let refIncome = Config.pa.construction.refIncome;

    // Calculate stats requied for comparison
    // "base cost of each resource * (((# of this type of structure + 1)^1.25)/1000 + 1) * (# of this type of structure + 1)"
    let nextRefCost = Math.floor(baseRefCost * ((Math.pow((lowestRef + 1), 1.25) / 1000 + 1)) * (lowestRef + 1));
//    console.log(`nextRefCost: ${nextRefCost}`);
    let nextFCCost = Math.floor(baseFCCost * ((Math.pow((fc + 1), 1.25) / 1000 + 1)) * (fc + 1));
//    console.log(`nextFCCost: ${nextFCCost}`);
    let totalMiningBonus = gov_bonus + population + (fc * fcBonus);
//    console.log(`totalMiningBonus: ${totalMiningBonus}`);
    let roidMining = roids * roidIncome;
//    console.log(`roidMining: ${roidMining}`);
    let coreRefIncome = ((metal_ref + crystal_ref + eon_ref) * refIncome) + (coreIncome * 3);
//    console.log(`coreRefIncome: ${coreRefIncome}`);
    let totalIncome = Math.floor((roidMining + coreRefIncome) * (1 + totalMiningBonus));
//    console.log(`totalIncome: ${totalIncome}`);

    // Calculate the income that can be generated by adding a refinery
    let extraRefIncome = refIncome * (1 + totalMiningBonus);
//    console.log(`extraRefIncome: ${extraRefIncome}`);
    let extraFCIncome = Math.floor(((roidMining + coreRefIncome) * (1 + (totalMiningBonus + fcBonus))) - totalIncome);
//    console.log(`extraFCIncome: ${extraFCIncome}`);
    let eorRefGen = (extraRefIncome * ticksLeft) - nextRefCost;
//    console.log(`eorRefGen: ${eorRefGen}`);
    let eorFCGen = (extraFCIncome * ticksLeft) - nextFCCost;
//    console.log(`eorFCGen: ${eorFCGen}`);

    // Get the value of potential extra resources per construction unit
    let eorRefGenCU = Math.round(eorRefGen / Config.pa.construction.refCU);
    let eorFCGenCU = Math.round(eorFCGen / Config.pa.construction.fcCU);

    // return results
    if (eorRefGenCU >= eorFCGenCU) {
      reply = `Recommendation - Build Refineries\nFor every CU spent on FC you will generate ${eorFCGenCU} resources by EOR.\nFor every CU spent on Refineries you will generate ${eorRefGenCU} resources by EOR.`;
    } else {
      reply = `Recommendation - Build Finance Centres\nFor every CU spent on FC you will generate ${eorFCGenCU} resources by EOR.\nFor every CU spent on Refineries you will generate ${eorRefGenCU} resources by EOR.`;
    }
  }
  return reply;
}


export default refsvsfcs;

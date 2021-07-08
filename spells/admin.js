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
 * @name admin.js
 * @version 2021/06/07
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const TelegramGroup = require('../models/TelegramGroup');
const GalMate = require('../models/GalMate');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require('util');


let Admin_leavegroup_usage = he.encode('!leavegroup [group id]');
let Admin_leavegroup_desc = 'Leaves a group, supergroup, or channel.';
let Admin_leavegroup = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    let groupid;
    if (args == null || args.length === 0) {
      groupid = ctx.chat.id;
    } else if (args.length > 0) {
      groupid = args[0];
    }
    //console.log('CHATID:' + util.inspect(chatid, false, null, true));
    if(!groupid) {reject(Admin_leavegroup_usage);}
    ctx.telegram.leaveChat(groupid).then(async(result) => {
      //console.log('RESULT:' + util.inspect(result, false, null, true));
      await TelegramGroup.deleteOne({id: groupid});
      resolve(`left the group ${groupid}`);
    }).catch((error) => {
      reject(`unable to leave the group ${groupid}.\n${error}`)
    });
    
  });
}

let Admin_listgroups_usage = he.encode('!listgroups');
let Admin_listgroups_desc = 'Lists groups bot is a member of.';
let Admin_listgroups = (args) => {
  return new Promise(async (resolve, reject) => {
    let groups = await TelegramGroup.find();
    console.log('CHATS:' + util.inspect(groups, false, null, true));
    for (let i = 0; i < groups.length; i++) {
      console.log(groups[i].name);
    }
    if(groups.length <= 0) {
      resolve('No groups.');
    } else {
      resolve(groups.map(function (chat) {
        return `id: ${chat.id}, type: ${chat.type}, title: ${chat.title}`;
      }).join('\n'));
    }
  });
}

let Admin_tickalert_usage = he.encode('!tickalert <on/off>');
let Admin_tickalert_desc = 'Turns tick alerts on/off.';
let Admin_tickalert = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let mode = args[0];
      if (!mode) {
        reject(Admin_tickalert_usage);
      }
      CFG.bot.tick_alert = mode.toLowerCase() === 'on';
      if(CFG.bot.tick_alert === (mode.toLowerCase() === 'on')) {
        //console.log('RESULT:' + util.inspect(result, false, null, true));
        resolve(`tick alerts turned ${mode}`);
      } else {
        reject(`unable to turn tick alerts ${mode}`)
      }
    } else {
      reject(Admin_tickalert_usage);
    }
  });
}


let Admin_addgalmate_usage = he.encode('!addgalmate <@GalMate>');
let Admin_addgalmate_desc = 'Adds a TG user as a GalMate.';
let Admin_addgalmate = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let tguser = args[0];
      if (!tguser) { reject(Admin_addgalmate_usage); }


      console.log('ctx.message: ' + util.inspect(ctx.message, false, null, true));
      console.log('ctx.mentions: ' + util.inspect(await ctx.mentions.get(ctx.message), false, null, true));

      let mentions = await ctx.mentions.get(ctx.message);
      console.log('MENTIONS: ' + util.inspect(mentions, false, null, true));
      if(mentions.length <= 0) {
        reject(`User ${tguser} not found.`);
      } else {
        if (!await GalMate.exists({id: mentions[0].id})) {
          let galm8 = new GalMate({
            id: mentions[0].id,
            first_name: mentions[0].first_name,
            last_name: mentions[0].last_name,
            username: mentions[0].username
          });
          let saved = await galm8.save();
          if (saved != null) {
            resolve(`GalMate added`);
          } else {
            reject(`Unable to add GalMate`);
          }
        } else {
          reject(`GalMate already exists`);
        }
      }
    } else {
      reject(Admin_addgalmate_usage);
    }
  });
}



module.exports = {
  "leavegroup": { usage: Admin_leavegroup_usage, description: Admin_leavegroup_desc, access: AXS.botAdminRequired, cast: Admin_leavegroup, include_ctx: true, private_reply: true },
  "listgroups": { usage: Admin_listgroups_usage, description: Admin_listgroups_desc, access: AXS.botAdminRequired, cast: Admin_listgroups, private_reply: true },
  //"tickalert": { usage: Admin_tickalert_usage, description: Admin_tickalert_desc, access: AXS.botAdminRequired, cast: Admin_tickalert, private_reply: true },
  "addgalmate": { usage: Admin_addgalmate_usage, description: Admin_addgalmate_desc, access: AXS.botAdminRequired, cast: Admin_addgalmate, include_ctx: true },
};

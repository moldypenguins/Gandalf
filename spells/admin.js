/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High, Sam Powis
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
 * @version 2023/01/08
 * @summary Gandalf Spells
 **/
'use strict';

const Mordor = require("../Mordor");
const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');

const TelegramGroup = require('../models/TelegramGroup');
const GalMate = require('../models/GalMate');
const Member = require('../models/Member');

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
    if(groups.length <= 0) {
      resolve('No groups.');
    } else {
      resolve(groups.map(function (chat) {
        return `id: ${chat.telegram_group_id}, type: ${chat.telegram_type}, title: ${chat.telegram_title}`;
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
      let mentions = await ctx.mentions.get(ctx.message);
      //console.log('MENTIONS: ' + util.inspect(mentions, false, null, true));
      if(mentions.length <= 0) {
        reject(`User ${tguser} not found.`);
      } else {
        if (!await GalMate.exists({telegram_user: mentions[0]})) {
          let galm8 = await new GalMate({
            _id: Mordor.Types.ObjectId(),
            telegram_user: mentions[0]
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


let Admin_addmember_usage = he.encode('!addmember <@tg-username> <pa-nick> [access-level]');
let Admin_addmember_desc = 'Adds a TG user as an ally member. See !access for access levels.';
let Admin_addmember = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let tguser = args[0];
      let nick = args[1];
      let access = numeral(args[2]).value();
      let access_level = 'Recruit';
      console.log(`tguser: ${tguser}`);
      console.log(`nick: ${nick}`);
      if (!tguser || !nick){
        reject(Admin_addmember_usage);
      } else { 
        let mentions = await ctx.mentions.get(ctx.message);
        //console.log('MENTIONS: ' + util.inspect(mentions, false, null, true));
        if(mentions.length <= 0) {
          reject(`User ${tguser} not found.`);
        } else {
          if (!await Member.exists({telegram_user: mentions[0]})) {
            let mbr = await new Member({
              _id: Mordor.Types.ObjectId(),
              pa_nick: nick,
              telegram_user: mentions[0]
            });
            if (access) {             
              switch(access) {
                case 1:
                  access_level = 'Member';
                break;
                case 3:
                  access_level = 'Commander';
                break;
                case 5:
                  access_level = 'Admin';
                break;                
                default:
                  access = 0;
              } 
              console.log(`access: ${access_level}`);
              mbr.access = access;
            }  
            let saved = await mbr.save();
            if (saved != null) {
              resolve(`${access_level} added.`);
            } else {
              reject(`Unable to add ${tguser}.`);
            }
          } else {
            reject(`Member already exists.`);
          }
        }
      }
    } else {
      reject(Admin_addmember_usage);
    }
  });
}

let Admin_listmembers_usage = he.encode('!listmembers');
let Admin_listmembers_desc = 'Lists ally members. See !access for access levels.';
let Admin_listmembers = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    let members = await Member.find();
    // console.log('MEMBERS:' + util.inspect(members, false, null, true));
    if(members.length <= 0) {
      resolve('No members.');
    } else {
      resolve(members.map(function (mbr) {
        return `tg: ${mbr.telegram_user.telegram_username} - nick: ${mbr.pa_nick} - access: ${mbr.access}`;
      }).join('\n'));
    }
  });
}

let Admin_delmember_usage = he.encode('!delmember <@tg-username>');
let Admin_delmember_desc = 'Deletes an ally member.';
let Admin_delmember = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let tguser = args[0];
      console.log(`tguser: ${tguser}`);
      if (!tguser){
         reject(Admin_addmember_usage);
      } else { 
        let mentions = await ctx.mentions.get(ctx.message);
        // console.log('MENTIONS: ' + util.inspect(mentions, false, null, true));
        if(mentions.length <= 0) {
          reject(`User ${tguser} not found.`);
        } else {
          if (await Member.exists({telegram_user: mentions[0]})) {
            let membr = await Member.deleteOne({
              telegram_user: mentions[0]
            });
            console.log(`membr: ${membr}`);
            if (membr != null) {
              resolve(`User ${tguser} removed from alliance membership.`);
            }  
          } else {
               reject(`User ${tguser} is not a member.`);
          }
        }
      }
    } else {
    reject(Admin_addmember_usage);
    }
  });
}

let Admin_access_usage = he.encode('!access <@tg-username> <access-level>');
let Admin_access_desc = 'Changes member access level. Access levels: 0 - Recruit | 1 - Member | 3 - Commander | 5 - Admin';
let Admin_access = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let tguser = args[0];
      let access = numeral(args[1]).value();
      console.log(`tguser: ${tguser}`);
      let access_level = 'Recruit';      
      if (!tguser || access == null) {
        reject(Admin_access_usage);
      } else { 
        let mentions = await ctx.mentions.get(ctx.message);
        //console.log('MENTIONS: ' + util.inspect(mentions, false, null, true));
        if(mentions.length <= 0) {
          reject(`User ${tguser} not found.`);
        } else {
          if (await Member.exists({telegram_user: mentions[0]})) {
            let levels = CFG.access;
            for (var lvl in levels) {
              let level = levels[lvl];
              console.log(`level ${JSON.stringify(level)}`);
/*              if (level.name.toLowerCase().startsWith(args[5].toLowerCase()) || goverment.name.toLowerCase().includes(args[5])) {
                gov_bonus = goverment.mining;
                console.log(`found ${gov_bonus}`) */
              }
            }
            switch(access) {
              case 1:
                access_level = 'Member';
              break;
              case 3:
                access_level = 'Commander';
              break;
              case 5:
                access_level = 'Admin';
              break;                
              default:
                access = 0;
            } 
            console.log(`access: ${access_level}`);
            let mbr = await Member.findOne({
              telegram_user: mentions[0]
            });
            mbr.access = access;            
            let saved = await mbr.save();
            if (saved != null) {
              resolve(`Set ${tguser} access as ${access_level}.`);
            }
          } else {
            reject(`${tguser} is not an allliance member.`);
          }
        }
      }
    } else {
      reject(Admin_access_usage);
    }
  });
}


module.exports = {
  "leavegroup": { usage: Admin_leavegroup_usage, description: Admin_leavegroup_desc, access: AXS.botAdminRequired, cast: Admin_leavegroup, include_ctx: true, private_reply: true },
  "listgroups": { usage: Admin_listgroups_usage, description: Admin_listgroups_desc, access: AXS.botAdminRequired, cast: Admin_listgroups, private_reply: true },
  //"tickalert": { usage: Admin_tickalert_usage, description: Admin_tickalert_desc, access: AXS.botAdminRequired, cast: Admin_tickalert, private_reply: true },
  "addgalmate": { usage: Admin_addgalmate_usage, description: Admin_addgalmate_desc, access: AXS.botAdminRequired, cast: Admin_addgalmate, include_ctx: true },
  "addmember": { usage: Admin_addmember_usage, description: Admin_addmember_desc, access: AXS.botAdminRequired, cast: Admin_addmember, include_ctx: true },
  "listmembers": { usage: Admin_listmembers_usage, description: Admin_listmembers_desc, access: AXS.botAdminRequired, cast: Admin_listmembers, private_reply: true },
  "delmember": { usage: Admin_delmember_usage, description: Admin_delmember_desc, access: AXS.botAdminRequired, cast: Admin_delmember, include_ctx: true },
  "access": { usage: Admin_access_usage, description: Admin_access_desc, access: AXS.botAdminRequired, cast: Admin_access, include_ctx: true },
};

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
 **/
const config = require('../config');
const access = require('../access');
const Chat = require('../models/chat');
const GalMate = require('../models/galmate');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const util = require('util');

let Admin_leavechat_usage = entities.encode('!leavechat [chat id]');
let Admin_leavechat_desc = 'Leaves a group, supergroup, or channel.';
let Admin_leavechat = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    let chatid;
    if (args == null || args.length === 0) {
      chatid = ctx.chat.id;
    } else if (args.length > 0) {
      chatid = args[0];
    }
    //console.log('CHATID:' + util.inspect(chatid, false, null, true));
    if(!chatid) {reject(Admin_leavechat_usage);}
    ctx.telegram.leaveChat(chatid).then(async(result) => {
      //console.log('RESULT:' + util.inspect(result, false, null, true));
      await Chat.remove({id: chatid});
      resolve(`left the group ${chatid}`);
    }).catch((error) => {
      reject(`unable to leave the group ${chatid}`)
    });
    
  });
}

let Admin_listchats_usage = entities.encode('!listchats');
let Admin_listchats_desc = 'Lists chats bot is a member of.';
let Admin_listchats = (args) => {
  return new Promise(async (resolve, reject) => {
    let chats = await Chat.find();
    console.log('CHATS:' + util.inspect(chats, false, null, true));
    for(let i = 0; i<chats.length; i++) {
      console.log(chats[i].name);
    }
    resolve(`Chats: ${chats.join('<br/>')}`);
  });
}

let Admin_tickalert_usage = entities.encode('!tickalert <on/off>');
let Admin_tickalert_desc = 'Turns tick alerts on/off.';
let Admin_tickalert = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let mode = args[0];
      if (!mode) {
        reject(Admin_tickalert_usage);
      }
      config.bot.tick_alert = mode.toLowerCase() === 'on';
      if(config.bot.tick_alert === (mode.toLowerCase() === 'on')) {
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


let Admin_addgalmate_usage = entities.encode('!addgalmate <@GalMate>');
let Admin_addgalmate_desc = 'Adds a TG user as a GalMate.';
let Admin_addgalmate = (args) => {
  return new Promise(async (resolve, reject) => {
    if (args.length > 0) {
      let tguser = args[0];
      if (!tguser) { reject(Admin_addgalmate_usage); }

      if(!await GalMate.exists({id:tguser.id})) {
        console.log('TGUSER:' + util.inspect(tguser, false, null, true));
        let galm8 = new GalMate({id:tguser.id,first_name:tguser.first_name,last_name:tguser.last_name,username:tguser.username});
        let saved = await galm8.save();
        if(saved != null) {
          resolve(`GalMate added`);
        } else {
          reject(`Unable to add GalMate`);
        }
      } else {
        reject(`GalMate already exists`);
      }
    } else {
      reject(Admin_addgalmate_usage);
    }
  });
}



module.exports = {
  "leavechat": { usage: Admin_leavechat_usage, description: Admin_leavechat_desc, access: access.botAdminRequired, cast: Admin_leavechat, include_ctx: true, private_reply: true },
  "listchats": { usage: Admin_listchats_usage, description: Admin_listchats_desc, access: access.botAdminRequired, cast: Admin_listchats, private_reply: true },
  "tickalert": { usage: Admin_tickalert_usage, description: Admin_tickalert_desc, access: access.botAdminRequired, cast: Admin_tickalert, private_reply: true },
  "addgalmate": { usage: Admin_addgalmate_usage, description: Admin_addgalmate_desc, access: access.botAdminRequired, cast: Admin_addgalmate },
};

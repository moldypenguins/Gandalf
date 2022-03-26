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
 * @name Gandalf.js
 * @version 2021/07/08
 * @summary Telegram Bot
 **/
'use strict';

const CFG = require('./Config');
const PA = require('./PA');
const Mordor = require('./Mordor');

const Member = require('./models/Member');
const Inactive = require('./models/Inactive');
const Tick = require('./models/Tick');
const GalMate = require('./models/GalMate');
const BotMessage = require('./models/BotMessage');
const Scan = require('./models/Scan');
const TelegramGroup = require('./models/TelegramGroup');
const TelegramUser = require('./models/TelegramUser');

const moment = require('moment');
const util = require('util');
//const url = require('url');
const bent = require('bent');
const getStream = bent('string');


let spells = {};
Object.assign(spells, require(`./spells/admin`));
CFG.bot.modules.forEach(function(name) {
  let spell = require(`./spells/${name}`);
  Object.assign(spells, spell);
});

const { Context, Telegraf } = require('telegraf');

const rateLimit = require('telegraf-ratelimit');
//Set limit to 1 message per 3 seconds
const limitConfig = {
  window: 3000,
  limit: 1,
  keyGenerator: (ctx) => {
    if(ctx.message && ctx.message.text && (ctx.message.text.startsWith(CFG.bot.private_cmd) || ctx.message.text.startsWith(CFG.bot.public_cmd))) {
      return ctx.from.id
    }
  },
  onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
};


Mordor.connection.once("open", () => {
  let bot = new Telegraf(CFG.bot.token, { telegram: { agent: null, webhookReply: false }, username: CFG.bot.username });
  bot.use(rateLimit(limitConfig));

  bot.use(async(ctx, next) => {
    //console.log('CHAT: id=' + ctx.message.chat.id + ' title=' + ctx.message.chat.title);
    //parse channel
    if(ctx?.message?.chat !== undefined && ctx.message.chat.type !== 'private') {
      await TelegramGroup.findOneAndUpdate({telegram_group_id: ctx.message.chat.id.toString()}, {telegram_title: ctx.message.chat.title, telegram_type: ctx.message.chat.type}, {upsert:true, new:true});
    }
    //parse user
    if(ctx?.message?.from !== undefined && !ctx.message.from.is_bot) {
      await TelegramUser.findOneAndUpdate({telegram_id: ctx.message.from.id}, {telegram_first_name: ctx.message.from.first_name, telegram_last_name: ctx.message.from.last_name, telegram_username: ctx.message.from.username, telegram_language_code: ctx.message.from.language_code}, {upsert:true, new:true});
    }
    next();
  });

  bot.context.mentions = {
    get: async (message) => {
      let mentions = [];
      if(message.entities !== undefined) {
        for (let i = 0; i < message.entities.filter(e => e.type === 'mention').length; i++) {
          let usrnm = message.text.substr(message.entities[i].offset, message.entities[i].length);
          console.log('usrnm: ' + util.inspect(usrnm, false, null, true));
          let usr = await TelegramUser.findOne({telegram_username: usrnm.replace('@', '')});
          if(usr != null) {
            mentions.push(usr);
          }
        }
        for (let i = 0; i < message.entities.filter(e => e.type === 'text_mention').length; i++) {
          let usr = await TelegramUser.findOne({telegram_first_name: message.entities[i].user.first_name, telegram_last_name: message.entities[i].user.last_name});
          if(usr != null) {
            mentions.push(usr);
          }
        }
      }
      return mentions;
    }
  }

  bot.start((ctx) => ctx.replyWithHTML(`Sign up: <a href="${CFG.web.uri}">${CFG.alliance.name}</a>`));
  
  bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  });

  function help(ctx, args, mem) {
    let commands = '<b>Commands:</b>\n' +
      '<b>help:</b> <i>Shows list of commands</i>\n' + 
      '<b>links:</b> <i>Shows web links</i>\n';
    for(let [key, value] of Object.entries(spells)) {
      //console.log('SPELL ENTRIES:' + util.inspect(value, false, null, true));
      if(!(spells[key].access !== undefined && (mem == null || (!spells[key].access(mem))))) {
        commands += (`<b>${key}:</b> <i>${value.description}</i>\n`);
      }
    }
    ctx.telegram.sendMessage(ctx.message.from.id, commands, {parse_mode: 'HTML'});
  }
  
  function links(ctx) {
    ctx.replyWithHTML(`<a href="${CFG.web.uri}">${CFG.alliance.name}</a>\n` + 
      //`<a href="https://status.${CFG.web.uri.substring(CFG.web.uri.indexOf('//') + 2)}">Web/Bot Status</a>\n` +
      `<a href="https://game.planetarion.com/">Planetarion</a>`);
  }
  
  //bot.help(help);
  //bot.settings((ctx) => {});
  //bot.command('links', (ctx) => links(ctx));
  bot.on('text', async(ctx) => {
    console.log(ctx.message);
    //parse scans
    if(ctx.message && ctx.message.text && ctx.message.entities && Array.isArray(ctx.message.entities)) {
      for(let entity in ctx.message.entities) {
        if(ctx.message.entities[entity].type === 'url') {
          let scanurl = new URL(ctx.message.text.substr(ctx.message.entities[entity].offset, ctx.message.entities[entity].length));
          console.log('SCANURL: ' + util.inspect(scanurl.searchParams, true, null, true));

          //let scanurl = url.parse(ctx.message.text.substr(ctx.message.entities[entity].offset, ctx.message.entities[entity].length), true);
          let page_content = await getStream(scanurl.href);
          if(scanurl.searchParams.get('scan_id') !== undefined && !await Scan.exists({scan_id:scanurl.searchParams.get('scan_id')})) {
            //scan
            try {
              let result = await Scan.parse(ctx.message.from.id, scanurl.searchParams.get('scan_id'), null, page_content);
              //console.log('SUCCESS: ' + result);
            } catch(err) {
              console.log('ERROR: ' + err);
            }
          }
          if(scanurl.searchParams.get('scan_grp') !== undefined) {
            //group
            let scans = page_content.split("<hr>");
            for(let i = 1; i < scans.length; i++) {
              let m = scans[i].match(/scan_id=([0-9a-zA-Z]+)/i);
              if(m != null  && !await Scan.exists({scan_id:m[1]})) {
                //console.log('M: ' +  util.inspect(m, false, null, true));
                try {
                  let result = await Scan.parse(ctx.message.from.id, m[1], scanurl.searchParams.get('scan_grp'), scans[i]);
                  //console.log('SUCCESS: ' + result);
                } catch(err) {
                  console.log('ERROR: ' + err);
                }
              }
            }
          }
        }
      }
    }
    
    //parse commands
    if(ctx.message && ctx.message.text && (ctx.message.text.startsWith(CFG.bot.private_cmd) || ctx.message.text.startsWith(CFG.bot.public_cmd))) {
      let tgUser = await TelegramUser.findOne({telegram_id: ctx.from.id});

      let mem = await Member.findOne({telegram_user: tgUser});
      let gm8 = await GalMate.findOne({telegram_user: tgUser});
      
      if(!mem && !gm8) {
        ctx.replyWithHTML('<i>Access denied!</i>', {reply_to_message_id: ctx.message.message_id});
        //ctx.replyWithAnimation({url: 'https://media.giphy.com/media/5SAPlGAS1YnLN9jHua/giphy-downsized-large.gif'}, {caption: 'Access denied!', inReplyTo: ctx.message.message_id});
      } else {
        let args = ctx.message.text.substr(1).toLowerCase().replace(/\s+/g, ' ').split(' ');
        let cmd = args.shift();
        //console.log('Command: ' + cmd);
        
        if (cmd === "help") {
          help(ctx, args, mem);
        } else if (cmd === "links") {
          links(ctx);
        } else if(cmd in spells && typeof(spells[cmd].cast) == 'function') {
          if(spells[cmd].channel !== undefined && !spells[cmd].channel(ctx.message.chat)) {
            ctx.replyWithHTML('<i>Wrong chat for this command.</i>', {reply_to_message_id: ctx.message.message_id});
          } else if(spells[cmd].access !== undefined && (mem == null || !spells[cmd].access(mem))) {
            ctx.replyWithHTML('<i>You do not have sufficient privileges.</i>', {reply_to_message_id:ctx.message.message_id});
          } else {
            let promise = null;
            if(spells[cmd].include_member) {
              promise = spells[cmd].cast(args, mem);
            } else if(spells[cmd].include_ctx) {
              promise = spells[cmd].cast(args, ctx);
            } else {
              promise = spells[cmd].cast(args);
            }
            promise.then((message) => {
              console.log(`Reply: ${message.toString()}`);
              if(typeof(spells[cmd].no_reply) == 'undefined') {
                  if ((typeof (spells[cmd].private_reply) == 'undefined' || !spells[cmd].private_reply) && ctx.message.text.startsWith(CFG.bot.public_cmd)) {
                      if (spells[cmd].send_as_video) {
                          ctx.telegram.sendVideo(ctx.chat.id, message);
                      } else {
                          ctx.replyWithHTML(message.toString(), {reply_to_message_id:ctx.message.message_id});
                      }
                  } else if (spells[cmd].private_reply || ctx.message.text.startsWith(CFG.bot.private_cmd)) {
                      if (spells[cmd].send_as_video) {
                          ctx.telegram.sendVideo(ctx.message.from.id, message);
                      } else {
                          ctx.telegram.sendMessage(ctx.message.from.id, message.toString(), {parse_mode:'HTML'});
                      }
                  }
              }
            }).catch((error) => {
              //console.log(`Error: ${error}`);
              //console.log(`Usage: ${spells[cmd].usage}`);
              ctx.replyWithHTML(error, {reply_to_message_id:ctx.message.message_id});
            });
          }
        }
      }
    }
  });

  console.log("Informing Gandalf of Sauron's return.");
  bot.launch().then(r => {});

  //enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  //check for messages from Frodo and Sauron
  setInterval(async () => {
    //console.log("Peering into Palantír.");
    if(await BotMessage.exists({sent:false})) {
      let msgs = await BotMessage.find({sent:false});
      //console.log('Messages: ' + util.inspect(msgs, false, null, true));
      for(let msg in msgs) {

        //console.log('Message: ' + util.inspect(msgs[msg], false, null, true));
        let res = await BotMessage.updateOne({_id:msgs[msg]._id}, {sent:true});
        if(res) {
          //console.log('Message: ' + util.inspect(res, false, null, true));
          try {
            if(msgs[msg].group_id !== 0) {
              await bot.telegram.sendMessage(`${msgs[msg].group_id}`, `${msgs[msg].message}`, {parse_mode: 'HTML'});
            }
            if(msgs[msg].group_id !== CFG.groups.admin) {
              await bot.telegram.sendMessage(`${CFG.groups.admin}`, `${msgs[msg].message}`, { parse_mode: 'HTML' });
            }
          } catch(err) {
            console.log('Error: ' + util.inspect(err, false, null, true));
          }
        }
      }
    }
  }, CFG.bot.message_interval * 1000);

});


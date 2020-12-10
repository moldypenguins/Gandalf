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
 * @version 2020/11/19
 * @summary Telegram Bot
 **/
const config = require('./config');
const db = require('./db');
const Member = require('./models/member');
const Tick = require('./models/tick');
const GalMate = require('./models/galmate');
const BotMessage = require('./models/botmessage');
const Scan = require('./models/scan');
const Chat = require('./models/chat');
const moment = require('moment');
const util = require('util');
const url = require('url');
const bent = require('bent');
const getStream = bent('string');

let spells = {};
Object.assign(spells, require(`./spells/admin`));
config.bot.modules.forEach(function(name) {
  let spell = require(`./spells/${name}`);
  Object.assign(spells, spell);
});

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')

const rateLimit = require('telegraf-ratelimit')
//Set limit to 1 message per 3 seconds
const limitConfig = {
  window: 3000,
  limit: 1,
  keyGenerator: (ctx) => {
    if(ctx.message && ctx.message.text && (ctx.message.text.startsWith(config.bot.private_cmd) || ctx.message.text.startsWith(config.bot.public_cmd))) {
      return ctx.from.id
    }
  },
  onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
};


db.connection.once("open", () => {
  let bot = new Telegraf(config.bot.token, { telegram: { agent: null, webhookReply: false }, username: config.bot.username });
  bot.use(rateLimit(limitConfig));

  bot.use((ctx, next) => {
    console.log('CHATID: ' + ctx.message.chat.id);
    if(!Chat.exists({id:ctx.message.chat.id})) {
      Chat.insertOne({id: ctx.message.chat.id, title: ctx.message.chat.title, type: ctx.message.chat.type});
    }
    next();
  });

  bot.start((ctx) => ctx.replyWithHTML(`Sign up: <a href="${config.web.uri}">${config.alliance.name}</a>`));
  
  bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  });
  
  function help(ctx, mem) {
    let commands = '<b>Commands:</b>\n' +
      '<b>help:</b> <i>Shows list of commands</i>\n' + 
      '<b>links:</b> <i>Shows web links</i>\n';
    for(let [key, value] of Object.entries(spells)) {
      //console.log('SPELL ENTRIES:' + util.inspect(value, false, null, true));
      
      if(!(typeof (spells[key].access) != 'undefined' && (mem == null || (!spells[key].access(mem))))) {
        commands += (`<b>${key}:</b> <i>${value.description}</i>\n`);
      }
    }
    ctx.telegram.sendMessage(ctx.message.from.id, commands, Extra.HTML().markup());
  }
  
  function links(ctx) {
    ctx.replyWithHTML(`<a href="${config.web.uri}">${config.alliance.name}</a>\n` + 
      `<a href="https://status.${config.web.uri.substring(config.web.uri.indexOf('//') + 2)}">Web/Bot Status</a>\n` + 
      `<a href="https://game.planetarion.com/">Planetarion</a>`);
  }
  
  //bot.help(help);
  //bot.settings((ctx) => {});
  //bot.command('links', (ctx) => links(ctx));
  bot.on('text', async (ctx) => {
    console.log(ctx.message);
    
    //parse channel
    
    
    //parse scans
    if(ctx.message && ctx.message.text && ctx.message.entities && Array.isArray(ctx.message.entities)) {
      for(let entity in ctx.message.entities) {
        if(ctx.message.entities[entity].type === 'url') {
          let link = ctx.message.text.substr(ctx.message.entities[entity].offset, ctx.message.entities[entity].length);
          console.log(`LINK: ${link}`);

          let matches = link.match(/showscan.pl\?scan_id=([a-z0-9]+)/i);
          console.log(`MATCHES: ${matches}`);
          if(Array.isArray(matches) && matches[1].length > 0) {
            let exists = await Scan.exists({id:matches[1]});
            if(!exists) {
              let start_time = Date.now();
              let scanurl = url.parse(config.pa.links.scans + '?scan_id=' + matches[1], true);
              let page_content = await getStream(scanurl.href);
              console.log(`Loaded scan from webserver in: ${Date.now() - start_time}ms`);
              
              try {
                let result = await Scan.parse(ctx.from.id, scanurl.query.scan_id, null, page_content);
                console.log('SUCCESS: ' + result);
              } catch(err) {
                console.log('ERROR: ' + err);
              }
            }
          }
        }
      }
    }
    
    //parse commands
    if(ctx.message && ctx.message.text && (ctx.message.text.startsWith(config.bot.private_cmd) || ctx.message.text.startsWith(config.bot.public_cmd))) {
      let mem = await Member.findOne({id: ctx.from.id});
      let gm8 = await GalMate.findOne({id: ctx.from.id});
      
      if(!mem && !gm8) {
        ctx.replyWithHTML('<i>Access denied!</i>', Extra.inReplyTo(ctx.message.message_id));
        //ctx.replyWithAnimation({url: 'https://media.giphy.com/media/5SAPlGAS1YnLN9jHua/giphy-downsized-large.gif'}, {caption: 'Access denied!', inReplyTo: ctx.message.message_id});
      } else {
        let args = ctx.message.text.substr(1).toLowerCase().replace(/\s+/g, ' ').split(' ');
        let cmd = args.shift();
        //console.log('Command: ' + cmd);
        
        if (cmd === "help") {
          help(ctx, mem);
        } else if (cmd === "links") {
          links(ctx);
        } else if(cmd in spells && typeof(spells[cmd].cast) == 'function') {
          if(typeof(spells[cmd].access) != 'undefined' && (mem == null || (!spells[cmd].access(mem)))) {
            ctx.replyWithHTML('<i>You do not have sufficient privileges.</i>', Extra.inReplyTo(ctx.message.message_id));
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
              console.log(`Reply: ${message}`);
              if(typeof(spells[cmd].no_reply) == 'undefined') {
                  if ((typeof (spells[cmd].private_reply) == 'undefined' || !spells[cmd].private_reply) && ctx.message.text.startsWith(config.bot.public_cmd)) {
                      if (spells[cmd].send_as_video) {
                          ctx.telegram.sendVideo(ctx.chat.id, message);
                      } else {
                          ctx.replyWithHTML(message, Extra.inReplyTo(ctx.message.message_id));
                      }
                  } else if (spells[cmd].private_reply || ctx.message.text.startsWith(config.bot.private_cmd)) {
                      if (spells[cmd].send_as_video) {
                          ctx.telegram.sendVideo(ctx.message.from.id, message);
                      } else {
                          ctx.telegram.sendMessage(ctx.message.from.id, message, Extra.HTML().markup());
                      }
                  }
              }
            }).catch((error) => {
              //console.log(`Error: ${error}`);
              //console.log(`Usage: ${spells[cmd].usage}`);
              ctx.replyWithHTML(error, Extra.inReplyTo(ctx.message.message_id));
            });
          }
        }
      }
    }
  });

  console.log('Informing Gandalf.');
  bot.launch().then(r => {});
  
  
  setInterval(async () => {
    //console.log("Peering into Palantír.");
    
    let msgs = await BotMessage.find({sent:false});
    //console.log('Messages: ' + util.inspect(msgs, false, null, true));
    if(msgs) {
      for(let msg in msgs) {
        //console.log('Message: ' + util.inspect(msgs[msg], false, null, true));
        let res = await BotMessage.updateOne({id:msgs[msg].id}, {sent:true});
        if(res) {
          //console.log('Sent: ' + util.inspect(res, false, null, true));
          await bot.telegram.sendMessage(`${msgs[msg].group_id}`, `${msgs[msg].message}`, { parse_mode: 'HTML' });
        }
      }
    }
  }, config.bot.message_interval * 1000);

});


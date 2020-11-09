var config = require('../config');
var db = require('../db');
var Member = require('../models/member');
var Tick = require('../models/tick');
var GalMate = require('../models/galmate');
var BotMessage = require('../models/botmessage');
var Scan = require('../models/scan');
var moment = require('moment');
const util = require('util');
const url = require('url');
const bent = require('bent');
const getStream = bent('string');

var spells = {};
Object.assign(spells, require(`./spells/admin`));
config.bot.modules.forEach(function(name) {
  var spell = require(`./spells/${name}`);
  Object.assign(spells, spell);
});

var Telegraf = require('telegraf')
var Extra = require('telegraf/extra')
/*
const rateLimit = require('telegraf-ratelimit')
//Set limit to 1 message per 3 seconds
const limitConfig = {
  window: 3000,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
}
*/

db.connection.once("open", () => {
  var bot = new Telegraf(config.bot.token, { telegram: { agent: null, webhookReply: false }, username: config.bot.username });
  //bot.use(rateLimit(limitConfig));
  
  bot.start((ctx) => ctx.replyWithHTML(`Sign up: <a href="${config.web.uri}">${config.alliance.name}</a>`));
  
  bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  });
  
  function help(ctx, mem) {
    var commands = '<b>Commands:</b>\n' + 
      '<b>help:</b> <i>Shows list of commands</i>\n' + 
      '<b>links:</b> <i>Shows web links</i>\n';
    for(let [key, value] of Object.entries(spells)) {
      //console.log('SPELL ENTRIES:' + util.inspect(value, false, null, true));
      
      if(!(typeof(spells[key].access) != 'undefined' && (mem == null || (mem != null && !spells[key].access(mem))))) {
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
      for(var entity in ctx.message.entities) {
        if(ctx.message.entities[entity].type == 'url') {
          var link = ctx.message.text.substr(ctx.message.entities[entity].offset, ctx.message.entities[entity].length);
          console.log(`LINK: ${link}`);
          
          var matches = link.match(/showscan.pl\?scan_id=([a-z0-9]+)/i);
          console.log(`MATCHES: ${matches}`);
          if(Array.isArray(matches) && matches[1].length > 0) {
            var exists = await Scan.exists({id:matches[1]});
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
      var mem = await Member.findOne({id: ctx.from.id});
      var gm8 = await GalMate.findOne({id: ctx.from.id});
      
      if(!mem && !gm8) {
        ctx.replyWithHTML('<i>Access denied!</i>', Extra.inReplyTo(ctx.message.message_id));
        //ctx.replyWithAnimation({url: 'https://media.giphy.com/media/5SAPlGAS1YnLN9jHua/giphy-downsized-large.gif'}, {caption: 'Access denied!', inReplyTo: ctx.message.message_id});
      } else {
        var args = ctx.message.text.substr(1).toLowerCase().replace(/\s+/g, ' ').split(' ');
        var cmd = args.shift();
        //console.log('Command: ' + cmd);
        
        if (cmd == "help") {
          help(ctx, mem);
        } else if (cmd == "links") {
          links(ctx);
        } else if(cmd in spells && typeof(spells[cmd].cast) == 'function') {
          if(typeof(spells[cmd].access) != 'undefined' && (mem == null || (mem != null && !spells[cmd].access(mem)))) {
            ctx.replyWithHTML('<i>You do not have sufficient privileges.</i>', Extra.inReplyTo(ctx.message.message_id));
          } else {
            var promise = null;
            if(spells[cmd].include_member) {
              promise = spells[cmd].cast(args, mem);
            } else if(spells[cmd].include_ctx) {
              promise = spells[cmd].cast(args, ctx);
            } else {
              promise = spells[cmd].cast(args);
            }
            promise.then((message) => {
              console.log(`Reply: ${message}`);
              if((typeof(spells[cmd].reply_private) == 'undefined' || !spells[cmd].reply_private) && ctx.message.text.startsWith(config.bot.public_cmd)) {
                if(spells[cmd].send_as_video) {
                  ctx.telegram.sendVideo(ctx.chat.id, message);
                } else {
                  ctx.replyWithHTML(message, Extra.inReplyTo(ctx.message.message_id));  
                }
              } else if(spells[cmd].reply_private || ctx.message.text.startsWith(config.bot.private_cmd)) {
                if(spells[cmd].send_as_video) {
                  ctx.telegram.sendVideo(ctx.message.from.id, message);
                } else {
                  ctx.telegram.sendMessage(ctx.message.from.id, message, Extra.HTML().markup());
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
  bot.launch();
  
  
  setInterval(async () => {
    console.log("Peering into Palantír.");
    
    var msgs = await BotMessage.find({sent:false});
    //console.log('Messages: ' + util.inspect(msgs, false, null, true));
    if(msgs) {
      for(let msg in msgs) {
        //console.log('Message: ' + util.inspect(msgs[msg], false, null, true));
        var res = await BotMessage.updateOne({id:msgs[msg].id}, {sent:true});
        if(res) {
          //console.log('Sent: ' + util.inspect(res, false, null, true));
          bot.telegram.sendMessage(`${msgs[msg].group_id}`, `${msgs[msg].message}`, { parse_mode: 'HTML' });
        }
      }
    }
  }, config.bot.message_interval * 1000);

});


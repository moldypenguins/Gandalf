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
 * @name gandalf.js
 * @version 2022-11-14
 * @summary Bot
 **/


import Config from 'galadriel';
import { Mordor, User, TelegramUser } from 'mordor';
import minimist from 'minimist';
import util from 'util';

import Spells from './spells/book.js';

let argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['register'],
  alias: { r: 'register' },
  default: { 'register': false },
  unknown: false
});

import { Context, Telegraf } from 'telegraf';
import { ActivityType, Client, Collection, Events, GatewayIntentBits, Routes, REST } from 'discord.js';



//register discord commands
if(argv.register) {
  const rest = new REST().setToken(Config.discord.token);
  (async () => {
    try {
      const dsSpells = [];
      Config.discord.commands.forEach(function(name) {
        if(Spells[name]) {
          dsSpells.push(Spells[name].discord.data.toJSON());
        }
      });
      const data = await rest.put(Routes.applicationCommands(Config.discord.client_id), {body: dsSpells});
      console.log(`Reloaded ${data.length} discord commands.`);
    } catch (err) {
      console.error(err);
    }
  })();
}

// connect to database
Mordor.connection.once("open", async () => {
  // *******************************************************************************************************************
  // Telegram
  // *******************************************************************************************************************
  const telegramBot = new Telegraf(Config.telegram.token, { telegram: { agent: null, webhookReply: false }, username: Config.telegram.username });

  //TODO: parse text for scan links

  telegramBot.use(async(ctx, next) => {
    if(ctx.message.entities && ctx.message.entities[0]?.type === 'bot_command') {
      let _user = await User.findByTGId(ctx.message.from.id);
      if(_user) {
        ctx.user = _user;
      }
      return next();
    }
  });

  telegramBot.context.mentions = {
    get: async (message) => {
      let mentions = [];
      if(message.entities !== undefined) {
        let eMentions = message.entities.filter(e => e.type === 'mention');
        for (let i = 0; i < eMentions.length; i++) {
          //console.log(`EMENT: ${util.inspect(eMentions[i], true, null, true)}`);
          let usrnm = message.text.slice(eMentions[i].offset, eMentions[i].offset + eMentions[i].length);
          //console.log('usrnm: ' + util.inspect(usrnm, false, null, true));
          let usr = await TelegramUser.findOne({tguser_username: usrnm.replace('@', '')});
          if(usr != null) {
            mentions.push(usr);
          }
        }
        let etMentions = message.entities.filter(e => e.type === 'text_mention');
        for (let i = 0; i < etMentions.length; i++) {
          let usr = await TelegramUser.findOne({tguser_first_name: etMentions.user.first_name, tguser_last_name: etMentions.user.last_name});
          if(usr != null) {
            mentions.push(usr);
          }
        }
      }
      return mentions;
    }
  }


  telegramBot.start(async(ctx) => {
    if(!await TelegramUser.exists({tguser_id: ctx.message.from.id})) {
      await new TelegramUser({
        _id: Mordor.Types.ObjectId(),
        tguser_id: ctx.message.from.id,
        tguser_first_name: ctx.message.from.first_name,
        tguser_username: ctx.message.from.username,
        tguser_language_code: ctx.message.from.language_code
      }).save();
      ctx.replyWithHTML(`Welcome.`);
    }
    else {
      ctx.replyWithHTML(`You already did this.`);
    }
  });

  telegramBot.help(async(ctx) => {
    if(!ctx.user) {
      ctx.replyWithHTML('<i>You shall not pass!</i>', {reply_to_message_id: ctx.message.message_id});
    }
    else {
      let commands = '<b>Commands:</b>\n<b>help:</b> <i>Shows list of commands</i>\n';
      for (let [key, value] of Object.entries(Spells)) {
        if(!Spells[key].access || Spells[key].access(ctx.user)) {
          commands += (`<b>${key}:</b> <i>${value.description}</i>\n`);
        }
      }
      await ctx.telegram.sendMessage(ctx.message.from.id, commands, {parse_mode: 'HTML'});
    }
  });

  telegramBot.command(async(ctx) => {
    console.log('command: ', ctx.message.text);
    if(!ctx.user) {
      ctx.replyWithHTML('<i>You shall not pass!</i>', {reply_to_message_id: ctx.message.message_id});
    }
    else {
      // Dynamic command handling
      let args = ctx.message.text.substring(1).replace(/\s+/g, ' ').replace(/[^a-z0-9áéíóúñü \.,_-]/gim,'').split(' ');
      let cmd = args.shift().toLowerCase();

      // Command alias check
      if(Config.telegram.commands.indexOf(cmd) < 0) {
        for(let [key, value] of Object.entries(Spells)) {
          if(value.alias && value.alias.includes(cmd)) {
            cmd = key;
          }
        }
      }

      if(Config.telegram.commands.indexOf(cmd) >= 0 && typeof (Spells[cmd]?.telegram?.execute) === 'function') {
        if(Spells[cmd].access && !Spells[cmd].access(ctx.user)) {
          ctx.replyWithHTML('You do not have access to this command.', {reply_to_message_id: ctx.message.message_id});
        }
        else {
          Spells[cmd].telegram.execute(ctx, args)
            .then((message) => {
              console.log(`Reply: ${message.toString()}`);
              ctx.replyWithHTML(message.toString(), {reply_to_message_id: ctx.message.message_id});
            })
            .catch((error) => {
              console.log(`Error: ${error}`);
              ctx.replyWithHTML(`Error: ${error}\n${Spells[cmd].usage}`, {reply_to_message_id: ctx.message.message_id});
            });
        }
      }
    }
  });

  telegramBot.catch(async(err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  });







  // *******************************************************************************************************************
  // Discord
  // *******************************************************************************************************************
  const discordBot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages
    ]
  });


  let dsCommands = new Collection();
  Config.discord.commands.forEach(function(name) {
    if(Spells[name]) {
      const cmd = Spells[name].discord;
      if ('data' in cmd && 'execute' in cmd) {
        dsCommands.set(cmd.data.name, cmd);
      }
      else {
        console.log(`[WARNING] The command ${name} is missing a required "data" or "execute" property.`);
      }
    }
    else {
      console.log(`[WARNING] The command ${name} was not found.`);
    }
  });
  discordBot.commands = dsCommands;

  discordBot.on(Events.ClientReady, () => {
    console.log(`Discord: Logged in as ${discordBot.user.tag}!`);
    discordBot.user.setActivity('over Endor', { type: ActivityType.Watching });
  });

  //TODO: parse text for scan links - figure out how in discord

  discordBot.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isChatInputCommand()) { return; }
    //console.log(interaction);

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
    }
    else {
      //TODO: add security
      try {
        await command.execute(interaction);
      }
      catch(err) {
        console.error(err);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
      }
    }

  });


  // *******************************************************************************************************************
  // Run bots
  // *******************************************************************************************************************
  console.log("Informing Gandalf of Sauron's return.");
  telegramBot.launch().then(r => {
    console.log(`Telegram: Logged in as ${telegramBot.botInfo.username}!`);
    if(argv.register) {
      //telegramBot.api.setMyCommands(Object.entries(tgCommands).map(([k, v], i) => { return { command: k, description: v.description }; }));
    }
  });
  discordBot.login(Config.discord.token);


  // *******************************************************************************************************************
  // Enable graceful stop
  // *******************************************************************************************************************
  let death = (code) => {
      console.log(`Death Code: ${code}`);
      telegramBot.stop(code);
      //discordBot.close(); //TODO: TypeError: discordBot.close is not a function
      process.exit();
  };
  [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`, `uncaughtException`].forEach((ev) => {
    process.on(ev, death.bind(null, ev));
  });
  process.on('exit', (code) => {
    console.log('Exiting...');
  });

});




/*
let scanurl = new URL(ctx.message.text.substring(ctx.message.entities[entity].offset, ctx.message.entities[entity].length));
console.log('SCANURL: ' + util.inspect(scanurl.searchParams, true, null, true));

if(scanurl.hostname === 'game.planetarion.com') {
  //let scanurl = url.parse(ctx.message.text.substr(ctx.message.entities[entity].offset, ctx.message.entities[entity].length), true);
  let page_content = await getStream(scanurl.href);
  if (scanurl.searchParams.get('scan_id') !== undefined && !await Scan.exists({scan_id: scanurl.searchParams.get('scan_id')})) {
    //scan
    try {
      let result = await Scan.parse(ctx.message.from.id, scanurl.searchParams.get('scan_id'), null, page_content);
      //console.log('SUCCESS: ' + result);
    } catch (err) {
      console.log('ERROR: ' + err);
    }
  }
  if (scanurl.searchParams.get('scan_grp') !== undefined) {
    //group
    let scans = page_content.split("<hr>");
    for (let i = 1; i < scans.length; i++) {
      let m = scans[i].match(/scan_id=([0-9a-zA-Z]+)/i);
      if (m != null && !await Scan.exists({scan_id: m[1]})) {
        //console.log('M: ' +  util.inspect(m, false, null, true));
        try {
          let result = await Scan.parse(ctx.message.from.id, m[1], scanurl.searchParams.get('scan_grp'), scans[i]);
          //console.log('SUCCESS: ' + result);
        } catch (err) {
          console.log('ERROR: ' + err);
        }
      }
    }
  }
}
*/


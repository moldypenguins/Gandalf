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
 * @name gandalf.js
 * @version 2022-11-14
 * @summary Bot
 **/
'use strict';

import { NODE_CONFIG_DIR, SUPPRESS_NO_CONFIG_WARNING } from './env.js';
import Config from 'config';
import { Mordor } from 'Mordor';
import minimist from 'minimist';
import util from 'util';

import * as TG_Spells from './spells/telegram.js';
import * as DS_Spells from './spells/discord.js';

let argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['register'],
  alias: { r: 'register' },
  default: { 'register': false },
  unknown: false
});

import { Context, Telegraf } from 'telegraf';
import { Client, Collection, Events, REST } from 'discord.js';

let tgCommands = {};
Config.telegram.commands.forEach(function(name) { Object.assign(tgCommands, TG_Spells); });

let dscmds = []; //temporary for registering commands in discord
let dsCommands = new Collection();
Config.discord.commands.forEach(function(name) {
  const cmd = DS_Spells;
  if('data' in cmd && 'execute' in cmd) {
    dsCommands.set(cmd.data.name, cmd);
    dscmds.push(cmd.data.toJSON());
  }
  else {
    console.log(`[WARNING] The command ${name} is missing a required "data" or "execute" property.`);
  }
});

//register discord commands
if(argv.register) {
  const rest = new REST().setToken(Config.discord.token);
  (async () => {
    try {
      const data = await rest.put(Routes.applicationCommands(Config.discord.client_id), {body: dscmds});
      console.log(`Reloaded ${data.length} discord commands.`);
    } catch (err) {
      console.error(err);
    }
  })();
}

// connect to database
Mordor.connection.once("open", async () => {
  // Telegram
  const telegramBot = new Telegraf(Config.telegram.token, { telegram: { agent: null, webhookReply: false }, username: Config.telegram.username });

  telegramBot.start(async (ctx) => ctx.replyWithHTML(`Sign up: <a href="${Config.web.uri}">${Config.alliance.name}</a>`));
  telegramBot.help(async (ctx) => {
    let commands = '<b>Commands:</b>\n<b>help:</b> <i>Shows list of commands</i>\n';
    for(let [key, value] of Object.entries(tgCommands)) {
      //if(!(tgCommands[key].access !== undefined && (mem == null || (!tgCommands[key].access(mem))))) {
        commands += (`<b>${key}:</b> <i>${value.description}</i>\n`);
      //}
    }
    await ctx.telegram.sendMessage(ctx.message.from.id, commands, {parse_mode: 'HTML'});
  });

  telegramBot.command(async (ctx) => {
    console.log('command', ctx.message.text)
    // Dynamic command handling
    let args = ctx.message.text.substring(1).toLowerCase().replace(/\s+/g, ' ').split(' ');
    let cmd = args.shift();
    if(cmd in tgCommands && typeof(tgCommands[cmd].cast) == 'function') {
      tgCommands[cmd].cast(args).then((message) => {
        console.log(`Reply: ${message.toString()}`);
        ctx.replyWithHTML(message.toString(), {reply_to_message_id: ctx.message.message_id});
      }).catch((error) => {
        console.log(`Error: ${error}`);
        ctx.replyWithHTML(`Error: ${error}\n${tgCommands[cmd].usage}`, {reply_to_message_id: ctx.message.message_id});
      });
    }
  });

  telegramBot.catch(async (err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  });



  // Discord
  const discordBot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages
    ]
  });

  discordBot.commands = dsCommands;

  discordBot.on(Events.ClientReady, () => {
    console.log(`Discord: Logged in as ${discordBot.user.tag}!`);
    discordBot.user.setActivity('over Endor', { type: ActivityType.Watching });
  });

  discordBot.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isChatInputCommand()) { return; }
    console.log(interaction);

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
    }
    else {
      try {
        await command.execute(interaction);
      }
      catch(err) {
        console.error(err);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
      }
    }

  });



  // Run bots
  console.log("Informing Gandalf of Sauron's return.");
  telegramBot.launch().then(r => {
    console.log(`Telegram: Logged in as ${telegramBot.botInfo.username}!`);
    if(argv.register) {
      telegramBot.api.setMyCommands(Object.entries(tgCommands).map(([k, v], i) => { return { command: k, description: v.description }; }));
    }
  });
  await discordBot.login(Config.discord.token);

  process.send('ready');

  // Enable graceful stop
  let death = (code) => {
      console.log(`Death Code: ${code}`);
      telegramBot.stop(code);
      discordBot.close();
      process.exit();
  };
  [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`, `uncaughtException`].forEach((ev) => {
    process.on(ev, death.bind(null, ev));
  });
  process.on('exit', (code) => {
    console.log('Exiting...');
  });

});

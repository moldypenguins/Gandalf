"use strict";
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


import Config from "sauron";
import {Mordor, Scan, User, TelegramChat, TelegramUser, BotMessage} from "mordor";
import DiscordEvents from "./DiscordEvents/DiscordEvents.js";
import DiscordCommands from "./DiscordCommands/DiscordCommands.js";
import TelegramCommands from "./TelegramCommands/TelegramCommands.js";
import { Context, Telegraf } from "telegraf";
import { limit } from "@grammyjs/ratelimiter";
import { ActivityType, Client, Collection, Events, GatewayIntentBits, Routes, REST } from "discord.js";
import minimist from "minimist";
import util from "util";

let argv = minimist(process.argv.slice(2), {
    string: [],
    boolean: ["register"],
    alias: { r: "register" },
    default: { "register": false },
    unknown: false
});


//register discord commands
if(argv.register) {
    const rest = new REST().setToken(Config.discord.token);
    (async () => {
        try {
            const dsCommands = [];
            for (let [key, value] of Object.entries(DiscordCommands)) {
                dsCommands.push(value.data.toJSON());
            }
            const data = await rest.put(Routes.applicationCommands(Config.discord.client_id), {body: dsCommands});
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
    
    //rate limit command use
    telegramBot.use(limit({
        timeFrame: 3000,
        limit: 1,
        keyGenerator: (ctx) => {
            if(!ctx.message?.entities || ctx.message.entities.filter(e => e.type === "url").length == 0) {
                return ctx.from.id;
            }
        },
        onLimitExceeded: (ctx, next) => ctx.reply("Rate limit exceeded")
    }));

    telegramBot.use(async(ctx, next) => {
        //console.log("CTX: ", util.inspect(ctx.message, true, null, true));

        //bot added or removed from a Telegram group
        if(ctx.update?.my_chat_member?.chat && ctx.update?.my_chat_member?.new_chat_member?.status) {
            if(ctx.update.my_chat_member.new_chat_member.status == "left") {
                console.log("Left: ", ctx.update.my_chat_member.chat.title);
                discordBot.channels.cache.get(Config.discord.channel_id).send({ embeds: [{ color: 0x7f7b81, title: "Telegram", description: `Removed from ${ctx.update.my_chat_member.chat.title}` }] });
                if(await TelegramChat.exists({tgchat_id: ctx.update.my_chat_member.chat.id})) {
                    await TelegramChat.deleteOne({tgchat_id: ctx.update.my_chat_member.chat.id});
                }
            } else if(ctx.update.my_chat_member.new_chat_member.status == "member") {
                discordBot.channels.cache.get(Config.discord.channel_id).send({ embeds: [{ color: 0x7f7b81, title: "Telegram", description: `Added to ${ctx.update.my_chat_member.chat.title}` }] });
                console.log("Joined", ctx.update.my_chat_member.chat.title);
                let _chat = await new TelegramChat({
                    _id: new Mordor.Types.ObjectId(),
                    tgchat_id: ctx.update.my_chat_member.chat.id,
                    tgchat_type: ctx.update.my_chat_member.chat.type,
                    tgchat_title: ctx.update.my_chat_member.chat.title
                }).save();
            }
        }
        
        //check for unknown groups
        if(ctx.message?.chat?.id && !ctx.message?.from?.is_bot && ctx.message.chat.type !== "private") {
            if(!(await TelegramChat.exists({tgchat_id: ctx.message.chat.id}))) {
                let _chat = await new TelegramChat({
                    _id: new Mordor.Types.ObjectId(),
                    tgchat_id: ctx.message.chat.id,
                    tgchat_type: ctx.message.chat.type,
                    tgchat_title: ctx.message.chat.title
                }).save();
            }
        }

        //parse message text for scan links
        if(ctx.message?.entities && !ctx.message?.from?.is_bot && ctx.message.entities.some(e => e.type === "url")) {
            for(let e = 0; e < ctx.message.entities.length; e++) {
                if(ctx.message.entities[e]?.type === "url") {
                    let _url = ctx.message.text.slice(ctx.message.entities[e].offset, ctx.message.entities[e].offset + ctx.message.entities[e].length);
                    if(_url.includes("showscan.pl")) {
                        let scanurl = new URL(_url);
                        //console.log("SCANURL: " + util.inspect(scanurl.searchParams, true, null, true));
                        if(scanurl.searchParams.get("scan_id") !== undefined) {
                            //scan
                            if(!await Scan.exists({scan_id: scanurl.searchParams.get("scan_id")})) {
                                try {
                                    //let result = await Scan.parse(ctx.message.from.id, scanurl.searchParams.get("scan_id"), null);
                                    //console.log('SUCCESS: ' + result);
                                } catch (err) {
                                    console.log("ERROR: " + err);
                                }
                            }
                        }
                        if (scanurl.searchParams.get("scan_grp") !== undefined) {
                            //scan group
                            if(!await Scan.exists({scan_grp: scanurl.searchParams.get("scan_grp")})) {
                                try {
                                    //let result = await Scan.parse(ctx.message.from.id, null, scanurl.searchParams.get("scan_grp"));
                                    //console.log('SUCCESS: ' + result);
                                } catch (err) {
                                    console.log("ERROR: " + err);
                                }
                            }
                        }
                    }
                }
            }
        }

        //limit commands to known Telegram users
        if(ctx.message?.entities && ctx.message.entities[0]?.type === "bot_command" && !ctx.message?.from?.is_bot) {
            let _user = await User.findByTGId(ctx.message.from.id);
            if(_user) {
                ctx.user = _user;
            } else {
                ctx.user = null;
            }
        }

        return next();
    });

    telegramBot.context.mentions = {
        get: async (message) => {
            let mentions = [];
            if(message.entities !== undefined) {
                let eMentions = message.entities.filter(e => e.type === "mention");
                for (let i = 0; i < eMentions.length; i++) {
                    //console.log(`EMENT: ${util.inspect(eMentions[i], true, null, true)}`);
                    let usrnm = message.text.slice(eMentions[i].offset, eMentions[i].offset + eMentions[i].length);
                    //console.log('usrnm: ' + util.inspect(usrnm, false, null, true));
                    let usr = await TelegramUser.findOne({tguser_username: usrnm.replace("@", "")});
                    if(usr != null) {
                        mentions.push(usr);
                    }
                }
                let etMentions = message.entities.filter(e => e.type === "text_mention");
                for (let i = 0; i < etMentions.length; i++) {
                    let usr = await TelegramUser.findOne({tguser_first_name: etMentions.user.first_name, tguser_last_name: etMentions.user.last_name});
                    if(usr != null) {
                        mentions.push(usr);
                    }
                }
            }
            return mentions;
        }
    };

    telegramBot.start(async(ctx) => {
        if(!await TelegramUser.exists({tguser_id: ctx.message.from.id})) {
            await new TelegramUser({
                _id: new Mordor.Types.ObjectId(),
                tguser_id: ctx.message.from.id,
                tguser_first_name: ctx.message.from.first_name,
                tguser_username: ctx.message.from.username,
                tguser_language_code: ctx.message.from.language_code
            }).save();
            ctx.replyWithHTML("Speak friend and enter.");
        }
        else {
            ctx.replyWithHTML("You already did this.");
        }
    });

    telegramBot.help(async(ctx) => {
        if(!await TelegramUser.exists({tguser_id: ctx.message.from.id})) {
            ctx.replyWithHTML("<i>You shall not pass!</i>\nuse /start", {reply_to_message_id: ctx.message.message_id});
        }
        else {
            let commands = "<b>Commands:</b>\n<b>help:</b> <i>Shows list of commands</i>\n";
            for (let [key, value] of Object.entries(TelegramCommands)) {
                if(!TelegramCommands[key].access || (ctx.user !== null && TelegramCommands[key].access(ctx.user))) {
                    commands += (`<b>${key}:</b> <i>${value.description}</i>\n`);
                }
            }
            await ctx.telegram.sendMessage(ctx.message.from.id, commands, {parse_mode: "HTML"});
        }
    });

    telegramBot.command(async(ctx) => {
        console.log("command: ", ctx.message.text);
        if(!await TelegramUser.exists({tguser_id: ctx.message.from.id})) {
            ctx.replyWithHTML("<i>You shall not pass!</i>\nuse /start", {reply_to_message_id: ctx.message.message_id});
        }
        else {
            //.replace(/[^a-z0-9áéíóúñü \.,_-:]/gim,'');

            // Dynamic command handling
            let args = ctx.message.text.substring(1).split(/\s+/);
            let cmd = args.shift().toLowerCase();

            // Command alias check
            if(TelegramCommands[cmd] != null) {
                for(let [key, value] of Object.entries(TelegramCommands)) {
                    if(value.alias && value.alias.includes(cmd)) {
                        cmd = key;
                    }
                }
            }

            if(typeof (TelegramCommands[cmd]?.telegram?.execute) === "function") {
                if(TelegramCommands[cmd].access && (ctx.user === null || !TelegramCommands[cmd].access(ctx.user))) {
                    ctx.replyWithHTML("You do not have access to this command.", {reply_to_message_id: ctx.message.message_id});
                }
                else {
                    TelegramCommands[cmd].telegram.execute(ctx, args)
                        .then((message) => {
                            console.log(`Reply: ${message.toString()}`);
                            ctx.replyWithHTML(message.toString(), {reply_to_message_id: ctx.message.message_id});
                        })
                        .catch((error) => {
                            console.log(`Error: ${error}`);
                            ctx.replyWithHTML(`Error: ${error}\n${TelegramCommands[cmd].usage}`, {reply_to_message_id: ctx.message.message_id});
                        });
                }
            }
        }
    });

    telegramBot.catch(async(err, ctx) => {
        console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
    });


    // *******************************************************************************************************************
    // Discord
    // *******************************************************************************************************************
    const discordBot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent
        ]
    });


    let dsCommands = new Collection();
    for(let [name, command] of Object.entries(DiscordCommands)) {
        if(DiscordCommands[name]) {
            if("data" in command && "execute" in command) {
                dsCommands.set(command.data.name, command);
            }
            else {
                console.log(`[WARNING] The command ${name} is missing a required "data" or "execute" property.`);
            }
        }
        else {
            console.log(`[WARNING] The command ${name} was not found.`);
        }
    }
    discordBot.commands = dsCommands;


    for(const ev in DiscordEvents) {
        //console.error(`HERE: ${util.inspect(BotEvents[ev], true, null, true)}`);
        if (DiscordEvents[ev].once) {
            discordBot.once(DiscordEvents[ev].name, (...args) => DiscordEvents[ev].execute(discordBot, ...args));
        } else {
            discordBot.on(DiscordEvents[ev].name, (...args) => DiscordEvents[ev].execute(discordBot, ...args));
        }
    }

    discordBot.on("messageCreate", (msg) => {
        //TODO: parse text for scan links
        if(msg.channelId === Config.discord.channel_id && !msg.author.bot) {
            console.log("text: ", util.inspect(msg.cleanContent, true, null, true));
        }
    });



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
                await interaction.reply({content: "There was an error while executing this command!", ephemeral: true});
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
    await discordBot.login(Config.discord.token);




    // *******************************************************************************************************************
    // Enable graceful stop
    // *******************************************************************************************************************
    let death = (code) => {
        console.log(`Death Code: ${code}`);
        telegramBot.stop(code);
        //discordBot.close(); //TODO: TypeError: discordBot.close is not a function
        process.exit();
    };
    ["SIGINT", "SIGUSR1", "SIGUSR2", "SIGTERM", "uncaughtException"].forEach((ev) => {
        process.on(ev, death.bind(null, ev));
    });
    process.on("exit", (code) => {
        console.log("Exiting...");
    });






    //check for messages from Frodo
    setInterval(async () => {
        if(await BotMessage.exists({sent:false})) {
            let msgs = await BotMessage.find({sent:false});
            if(msgs) {
                console.log(`Peering into Palantír. (${msgs.length})`);
                for (let m = 0; m < msgs.length; m++) {

                    if(Config.bot.tick_alert) {
                        await discordBot.channels.cache.get(Config.discord.tick_alert ? Config.discord.tick_alert : Config.discord.channel_id).send({
                            embeds: [{color: 0x7f7b81, title: msgs[m].title, description: msgs[m].description}]
                        });
                        await telegramBot.telegram.sendMessage(Config.telegram.tick_alert ? Config.telegram.tick_alert : Config.telegram.group_id,
                            `<b>${msgs[m].title}</b>\n${msgs[m].description}`,
                            {parse_mode: "html"}
                        );
                    }


                    //console.log("Message: " + util.inspect(res, false, 1, true));
                    await BotMessage.updateOne({_id: msgs[m]._id}, {sent: true});
                }
            }
        }
    }, Config.bot.message_interval * 1000);





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


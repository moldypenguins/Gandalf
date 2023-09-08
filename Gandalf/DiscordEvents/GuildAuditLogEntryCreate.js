"use strict";

import Config from "sauron";
import { AuditLogEvent, Events, roleMention, userMention, channelMention } from "discord.js";

export default {
    name: Events.GuildAuditLogEntryCreate,
    once: false,
    async execute(client, entry) {
        //console.log(`ENTRY: ${util.inspect(entry.changes[0], true, 3, true)}`);
        if(entry.targetId !== entry.executorId) {
            let audit_message;
            switch (entry.action) {
            //TODO: add remaining actions
    
            case AuditLogEvent.BotAdd:
                console.log("BotAdd");
                client.channels.cache.get(Config.discord.channel_id).send({
                    embeds: [{
                        color: 0x7f7b81,
                        title: "BotAdd",
                        description: `${userMention(entry.targetId)} was added to the server by ${userMention(entry.executorId)}.`
                    }]
                });


                break;
    
            case AuditLogEvent.MemberRoleUpdate:
                console.log("MemberRoleUpdate");
                switch(entry.changes[0].key) {
                case "$add":
                    audit_message = `MemberRoleUpdate: ${roleMention(entry.changes[0].new[0].id)} was added to ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                    break;
                case "$remove":
                    audit_message = `MemberRoleUpdate: ${roleMention(entry.changes[0].new[0].id)} was removed to ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                    break;
                }
                client.channels.cache.get(Config.discord.channel_id).send({
                    embeds: [{
                        color: 0x7f7b81,
                        title: "MemberRoleUpdate",
                        description: audit_message
                    }]
                });
                break;
    
            case AuditLogEvent.MemberUpdate:
                console.log("MemberUpdate");
                switch(entry.changes[0].key) {
                case "nick":
                    audit_message = `MemberUpdate: **${entry.changes[0].old}** was changed to **${entry.changes[0].new}** for member ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                    break;
                default:
                    audit_message = `MemberUpdate: ${entry.changes[0].key} by ${userMention(entry.executorId)}.`;
                }
                client.channels.cache.get(Config.discord.channel_id).send({
                    embeds: [{
                        color: 0x7f7b81,
                        title: "MemberRoleUpdate",
                        description: audit_message
                    }]
                });
                break;
    
            case AuditLogEvent.MessageDelete:
                console.log("MessageDelete");
                client.channels.cache.get(Config.discord.channel_id).send({
                    embeds: [{
                        color: 0x7f7b81,
                        title: "MessageDelete",
                        description: `A message from ${userMention(entry.targetId)} was deleted by ${userMention(entry.executorId)} in ${channelMention(entry.extra.channel.id)}.`
                    }]
                });
                break;
    
    
    
            default:
    
                client.channels.cache.get(Config.discord.channel_id).send({ embeds: [{ color: 0x7f7b81, description: `Unhandled action (${entry.action}).` }] });

            }

            
            
        }
    },
};

"use strict";

import Config from "sauron";
import { AuditLogEvent, Events, roleMention, userMention, channelMention } from "discord.js";

export default {
    name: Events.GuildAuditLogEntryCreate,
    once: false,
    async execute(client, entry) {
        //console.log(`ENTRY: ${util.inspect(entry.changes[0], true, 3, true)}`);
      
        let audit_message = `Unhandled action (${entry.action}).`;

        switch (entry.action) {
        //TODO: add remaining actions


        case AuditLogEvent.GuildUpdate:
            console.log("GuildUpdate: Server settings were updated");
            audit_message = "GuildUpdate: Server settings were updated";
            break;

        case AuditLogEvent.ApplicationCommandPermissionUpdate:
            console.log("ApplicationCommandPermissionUpdate: Permissions were updated for a command");
            audit_message = "ApplicationCommandPermissionUpdate: Permissions were updated for a command";
            break;

        case AuditLogEvent.GuildScheduledEventCreate:
            console.log("GuildScheduledEventCreate: Event was created");
            audit_message = "GuildScheduledEventCreate: Event was created";
            break;

        case AuditLogEvent.GuildScheduledEventUpdate:
            console.log("GuildScheduledEventUpdate: Event was updated");
            audit_message = "GuildScheduledEventUpdate: Event was updated";
            break;

        case AuditLogEvent.GuildScheduledEventDelete:
            console.log("GuildScheduledEventDelete: Event was cancelled");
            audit_message = "GuildScheduledEventDelete: Event was cancelled";
            break;

        case AuditLogEvent.ThreadCreate:
            console.log("ThreadCreate: Thread was created in a channel");
            audit_message = "ThreadCreate: Thread was created in a channel";
            break;

        case AuditLogEvent.ThreadUpdate:
            console.log("ThreadUpdate: Thread settings were updated");
            audit_message = "ThreadUpdate: Thread settings were updated";
            break;

        case AuditLogEvent.ThreadDelete:
            console.log("ThreadDelete: Thread was deleted");
            audit_message = "ThreadDelete: Thread was deleted";
            break;

        case AuditLogEvent.ChannelCreate:
            console.log("ChannelCreate: Channel was created");
            audit_message = "ChannelCreate: Channel was created";
            break;

        case AuditLogEvent.ChannelUpdate:
            console.log("ChannelUpdate: Channel settings were updated");
            audit_message = "ChannelUpdate: Channel settings were updated";
            break;

        case AuditLogEvent.ChannelDelete:
            console.log("ChannelDelete: Channel was deleted");
            audit_message = "ChannelDelete: Channel was deleted";
            break;

        case AuditLogEvent.ChannelOverwriteCreate:
            console.log("ChannelOverwriteCreate: Permission overwrite was added to a channel");
            audit_message = "ChannelOverwriteCreate: Permission overwrite was added to a channel";
            break;

        case AuditLogEvent.ChannelOverwriteUpdate:
            console.log("ChannelOverwriteUpdate: Permission overwrite was updated for a channel");
            audit_message = "ChannelOverwriteUpdate: Permission overwrite was updated for a channel";
            break;

        case AuditLogEvent.ChannelOverwriteDelete:
            console.log("ChannelOverwriteDelete: Permission overwrite was deleted from a channel");
            audit_message = "ChannelOverwriteDelete: Permission overwrite was deleted from a channel";
            break;


        case AuditLogEvent.BotAdd:
            console.log("BotAdd: Bot user was added to server");
            audit_message = `BotAdd: ${userMention(entry.targetId)} was added to the server by ${userMention(entry.executorId)}.`;
            break;

        case AuditLogEvent.InviteCreate:
            console.log("InviteCreate: Server invite was created");
            audit_message = "InviteCreate: Server invite was created";
            break;

        case AuditLogEvent.InviteUpdate:
            console.log("InviteUpdate: Server invite was updated");
            audit_message = "InviteUpdate: Server invite was updated";
            break;

        case AuditLogEvent.InviteDelete:
            console.log("InviteDelete: Server invite was deleted");
            audit_message = "InviteDelete: Server invite was deleted";
            break;

        case AuditLogEvent.WebhookCreate:
            console.log("WebhookCreate: Webhook was created");
            audit_message = "WebhookCreate: Webhook was created";
            break;

        case AuditLogEvent.WebhookUpdate:
            console.log("WebhookUpdate: Webhook properties or channel were updated");
            audit_message = "WebhookUpdate: Webhook properties or channel were updated";
            break;

        case AuditLogEvent.WebhookDelete:
            console.log("WebhookDelete: Webhook was deleted");
            audit_message = "WebhookDelete: Webhook was deleted";
            break;

        case AuditLogEvent.EmojiCreate:
            console.log("EmojiCreate: Emoji was created");
            audit_message = "EmojiCreate: Emoji was created";
            break;

        case AuditLogEvent.EmojiUpdate:
            console.log("EmojiUpdate: Emoji name was updated");
            audit_message = "EmojiUpdate: Emoji name was updated";
            break;

        case AuditLogEvent.EmojiDelete:
            console.log("EmojiDelete: Emoji was deleted");
            audit_message = "EmojiDelete: Emoji was deleted";
            break;







        case AuditLogEvent.MemberRoleUpdate:
            console.log("MemberRoleUpdate: Member was added or removed from a role");
            switch (entry.changes[0].key) {
            case "$add":
                audit_message = `MemberRoleUpdate: ${roleMention(entry.changes[0].new[0].id)} was added to ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                break;
            case "$remove":
                audit_message = `MemberRoleUpdate: ${roleMention(entry.changes[0].new[0].id)} was removed to ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                break;
            }
            break;


        case AuditLogEvent.MemberUpdate:
            console.log("MemberUpdate: Member was updated in server");
            switch (entry.changes[0].key) {
            case "nick":
                audit_message = `MemberUpdate: **${entry.changes[0].old}** was changed to **${entry.changes[0].new}** for member ${userMention(entry.targetId)} by ${userMention(entry.executorId)}.`;
                break;
            default:
                audit_message = `MemberUpdate: ${entry.changes[0].key} by ${userMention(entry.executorId)}.`;
            }
            break;


        case AuditLogEvent.MemberKick:
            console.log("MemberKick: Member was removed from server");
            audit_message = `MemberKick: ${userMention(entry.targetId)} was kicked by ${userMention(entry.executorId)}.\nReason: ${entry.reason}`;
            break;



        case AuditLogEvent.MemberPrune:
            console.log("MemberPrune: Members were pruned from server");
            audit_message = "MemberPrune: Members were pruned from server";
            break;

        case AuditLogEvent.MemberBanAdd:
            console.log("MemberBanAdd: Member was banned from server");
            audit_message = "MemberBanAdd: Member was banned from server";
            break;

        case AuditLogEvent.MemberBanRemove:
            console.log("MemberBanRemove: Server ban was lifted for a member");
            audit_message = "MemberBanRemove: Server ban was lifted for a member";
            break;



        case AuditLogEvent.MemberMove:
            console.log("MemberMove: Member was moved to a different voice channel");
            audit_message = "MemberMove: Member was moved to a different voice channel";
            break;


        case AuditLogEvent.MemberDisconnect:
            console.log("MemberDisconnect: Member was disconnected from a voice channel");
            audit_message = "MemberDisconnect: Member was disconnected from a voice channel";
            break;














        case AuditLogEvent.MessageDelete:
            console.log("MessageDelete: Single message was deleted");
            audit_message = `MessageDelete: a message from ${userMention(entry.targetId)} was deleted by ${userMention(entry.executorId)} in ${channelMention(entry.extra.channel.id)}.`;
            break;


        case AuditLogEvent.MessageBulkDelete:
            console.log("MessageBulkDelete: Multiple messages were deleted");
            audit_message = "MessageBulkDelete: Multiple messages were deleted";
            break;

        case AuditLogEvent.MessagePin:
            console.log("MessagePin: Message was pinned to a channel");
            audit_message = "MessagePin: Message was pinned to a channel";
            break;


        case AuditLogEvent.MessageUnpin:
            console.log("MessageUnpin: Message was unpinned from a channel");
            audit_message = "MessageUnpin: Message was unpinned from a channel";
            break;






        case AuditLogEvent.IntegrationCreate:
            console.log("IntegrationCreate: App was added to server");
            audit_message = "IntegrationCreate: App was added to server";
            break;

        case AuditLogEvent.IntegrationUpdate:
            console.log("IntegrationUpdate: App was updated (as an example, its scopes were updated)");
            audit_message = "IntegrationUpdate: App was updated (as an example, its scopes were updated)";
            break;

        case AuditLogEvent.IntegrationDelete:
            console.log("IntegrationDelete: App was removed from server");
            audit_message = "IntegrationDelete: App was removed from server";
            break;


        case AuditLogEvent.StageInstanceCreate:
            console.log("StageInstanceCreate: Stage instance was created (stage channel becomes live)");
            audit_message = "StageInstanceCreate: Stage instance was created (stage channel becomes live)";
            break;

        case AuditLogEvent.StageInstanceUpdate:
            console.log("StageInstanceUpdate: Stage instance details were updated");
            audit_message = "StageInstanceUpdate: Stage instance details were updated";
            break;

        case AuditLogEvent.StageInstanceDelete:
            console.log("StageInstanceDelete: Stage instance was deleted (stage channel no longer live)");
            audit_message = "StageInstanceDelete: Stage instance was deleted (stage channel no longer live)";
            break;

        case AuditLogEvent.StickerCreate:
            console.log("StickerCreate: Sticker was created");
            audit_message = "StickerCreate: Sticker was created";
            break;

        case AuditLogEvent.StickerUpdate:
            console.log("StickerUpdate: Sticker details were updated");
            audit_message = "StickerUpdate: Sticker details were updated";
            break;

        case AuditLogEvent.StickerDelete:
            console.log("StickerDelete: Sticker was deleted");
            audit_message = "StickerDelete: Sticker was deleted";
            break;




        case AuditLogEvent.AutoModerationRuleCreate:
            console.log("AutoModerationRuleCreate: Auto Moderation rule was created");
            audit_message = "AutoModerationRuleCreate: Auto Moderation rule was created";
            break;

        case AuditLogEvent.AutoModerationRuleUpdate:
            console.log("AutoModerationRuleUpdate: Auto Moderation rule was updated");
            audit_message = "AutoModerationRuleUpdate: Auto Moderation rule was updated";
            break;

        case AuditLogEvent.AutoModerationRuleDelete:
            console.log("AutoModerationRuleDelete: Auto Moderation rule was deleted");
            audit_message = "AutoModerationRuleDelete: Auto Moderation rule was deleted";
            break;

        case AuditLogEvent.AutoModerationBlockMessage:
            console.log("AutoModerationBlockMessage: Message was blocked by Auto Moderation");
            audit_message = "AutoModerationBlockMessage: Message was blocked by Auto Moderation";
            break;

        case AuditLogEvent.AutoModerationFlagToChannel:
            console.log("AutoModerationFlagToChannel: Message was flagged by Auto Moderation");
            audit_message = "AutoModerationFlagToChannel: Message was flagged by Auto Moderation";
            break;

        case AuditLogEvent.AutoModerationUserCommunicationDisabled:
            console.log("AutoModerationUserCommunicationDisabled: Member was timed out by Auto Moderation");
            audit_message = "AutoModerationUserCommunicationDisabled: Member was timed out by Auto Moderation";
            break;

        }
  
        client.channels.cache.get(Config.discord.channel_id).send({ embeds: [{ color: 0x7f7b81, description: audit_message }] });

    },
};

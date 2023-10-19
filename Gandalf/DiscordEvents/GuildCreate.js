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
 * @name events.js
 * @version 2023-05-20
 * @summary bot DiscordEvents
 **/
import Config from "sauron";
import { Mordor, DiscordGuild } from "mordor";
import { ActivityType, Events } from "discord.js";

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(client, guild) {
        console.log(`Discord: Joined guild ${guild.name} (${guild.id})!`);

        let res = await new DiscordGuild({
            _id: new Mordor.Types.ObjectId(),
            dsguild_id: guild.id,
            dsguild_ownerId: guild.ownerId,
            dsguild_name: guild.name,
            dsguild_description: guild.description
        }).save();

        //admin logging
        client.channels.cache.get(Config.discord.channel_id).send({ embeds: [{ color: 0x7f7b81, title: "Discord", description: `GuildCreate: joined guild ${guild.name} (${guild.id}).` }] });
    },
};

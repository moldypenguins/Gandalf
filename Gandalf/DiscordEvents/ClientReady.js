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
import { ActivityType, Events } from "discord.js";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(discordBot) {
        console.log(`Discord: Logged in as ${discordBot.user.tag}!`);
        discordBot.user.setActivity("over Endor", { type: ActivityType.Watching });
        discordBot.channels.cache.get(Config.discord.channel_id).send("Gandalf embarking on the Quest for Erebor!");
    },
};

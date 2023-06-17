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

import ClientReady from "./ClientReady.js";
import GuildAuditLogEntryCreate from "./GuildAuditLogEntryCreate.js";
import GuildCreate from "./GuildCreate.js";

let DiscordEvents = {
    ClientReady,
    GuildAuditLogEntryCreate,
    GuildCreate
};

export default DiscordEvents;


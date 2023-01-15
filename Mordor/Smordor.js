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
 * @name mordor.js
 * @version 2022/11/16
 * @summary Database
 **/
'use strict';

import Config from 'galadriel';
import mongoose from 'mongoose';
import AllianceDump from './models/AllianceDump.js';
import DiscordGuild from './models/DiscordGuild.js';
import DiscordUser from './models/DiscordUser.js';
import GalaxyDump from './models/GalaxyDump.js';
import Member from './models/Member.js';
import PlanetDump from './models/PlanetDump.js';
import Ship from './models/Ship.js';
import TelegramChat from './models/TelegramChat.js';
import TelegramUser from './models/TelegramUser.js';
import Tick from './models/Tick.js';

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb://${Config.db.url}`, {
    authSource:'admin',
    user: Config.db.user,
    pass: Config.db.pass,
    dbName: Config.db.name
  }).catch((err) => console.log(err.reason));
mongoose.connection.on("error", (err) => console.log(err.reason));
mongoose.connection.once("connected", () => console.log(`Evil is stirring in Mordor.`));

export {
  mongoose as Mordor,
  AllianceDump,
  DiscordGuild,
  DiscordUser,
  GalaxyDump,
  Member,
  PlanetDump,
  Ship,
  TelegramChat,
  TelegramUser,
  Tick
};

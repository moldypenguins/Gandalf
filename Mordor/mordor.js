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
 * @name mordor.js
 * @version 2023/01/18
 * @summary Database
 **/


import Config from 'galadriel';
import mongoose from 'mongoose';
import Alliance from "./models/Alliance.js";
import AllianceDump from './models/AllianceDump.js';
import AllianceHistory from "./models/AllianceHistory.js";
import Cluster from './models/Cluster.js';
import ClusterHistory from './models/ClusterHistory.js';
import DiscordGuild from './models/DiscordGuild.js';
import DiscordUser from './models/DiscordUser.js';
import Galaxy from './models/Galaxy.js';
import GalaxyDump from './models/GalaxyDump.js';
import GalaxyHistory from './models/GalaxyHistory.js';
import HeroPower from './models/HeroPower.js';
import Planet from './models/Planet.js';
import PlanetDump from './models/PlanetDump.js';
import PlanetHistory from './models/PlanetHistory.js';
import PlanetTrack from './models/PlanetTrack.js';
import Scan from './models/Scan.js';
import ScanDevelopment from './models/ScanDevelopment.js';
import ScanJumpgate from './models/ScanJumpgate.js';
import ScanMilitary from './models/ScanMilitary.js';
import ScanPlanet from './models/ScanPlanet.js';
import ScanUnit from './models/ScanUnit.js';
import Ship from './models/Ship.js';
import TelegramChat from './models/TelegramChat.js';
import TelegramUser from './models/TelegramUser.js';
import Tick from './models/Tick.js';
import User from './models/User.js';

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb://${Config.db.url}`, {
    //user: Config.db.user,
    //pass: Config.db.pass,
    dbName: Config.db.name
  }).catch((err) => console.log(err.reason));
mongoose.connection.on("error", (err) => console.log(err.reason));
mongoose.connection.once("open", () => console.log(`Evil is stirring in Mordor.`));

export {
  mongoose as Mordor,
  Alliance,
  AllianceDump,
  AllianceHistory,
  Cluster,
  ClusterHistory,
  DiscordGuild,
  DiscordUser,
  Galaxy,
  GalaxyDump,
  GalaxyHistory,
  HeroPower,
  Planet,
  PlanetDump,
  PlanetHistory,
  PlanetTrack,
  Scan,
  ScanDevelopment,
  ScanJumpgate,
  ScanMilitary,
  ScanPlanet,
  ScanUnit,
  Ship,
  TelegramChat,
  TelegramUser,
  Tick,
  User,
};

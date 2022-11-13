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
 * @name Mordor.js
 * @version 2022/10/24
 * @summary Database
 **/
'use strict';

const Config = require('config').get('config');
const Mordor = require("mongoose");

Mordor.connect(`${Config.db.uri}/${Config.db.name}`).catch(err => console.log(err.reason));
Mordor.connection.on("error", () => {
  console.log("Error: database connection failed.");
});
Mordor.connection.once("connected", () => {
  console.log("Evil is stirring in Mordor.");
});

module.exports = {
  "Mordor": Mordor,
  "AllianceDump": require("./models/AllianceDump.js"),
  "DiscordGuild": require("./models/DiscordGuild.js"),
  "DiscordUser": require("./models/DiscordUser.js"),
  "GalaxyDump": require("./models/GalaxyDump.js"),
  "Member": require("./models/Member.js"),
  "PlanetDump": require("./models/PlanetDump.js"),
  "Ship": require("./models/AllianceDump.js"),
  "TelegramChat": require("./models/AllianceDump.js"),
  "TelegramUser": require("./models/AllianceDump.js"),
  "Tick": require("./models/AllianceDump.js")
};
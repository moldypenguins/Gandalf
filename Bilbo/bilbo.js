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
 * @name bilbo.js
 * @version 2022-11-11
 * @summary setup
 * @param {string} -s,--start tick start date
 **/


import Config from 'Galadriel/src/galadriel.ts';
import dayjs from 'dayjs';
import axios from 'axios';
import X2JS from 'x2js';
import minimist from 'minimist';
import {DiscordUser, User, Mordor, Ship, TelegramUser, Tick, PlanetDump, Planet, Cluster, Galaxy, GalaxyDump, Alliance, AllianceDump} from 'mordor';


let argv = minimist(process.argv.slice(2), {
  string: ['start'],
  boolean: [],
  alias: {s:'start'},
  unknown: false
});

Mordor.connection.once("open", async() => {
  if(!argv.start) {
    console.log(`A start date must be provided.`);
  }
  else {
    await clear_database();
    await load_ships();
    await load_ticks(dayjs(argv.start));
    await setup_admin();
  }
  process.exit(0);
});


let clear_database = async() => {
  await Ship.deleteMany({});
  await Tick.deleteMany({});

  await PlanetDump.deleteMany({});
  await GalaxyDump.deleteMany({});
  await AllianceDump.deleteMany({});
  await Planet.deleteMany({});
  await Galaxy.deleteMany({});
  await Cluster.deleteMany({});
  await Alliance.deleteMany({});

  await User.updateMany({}, {$unset:{planet:""}})
};

let load_ships = async() => {
  let shipstats;
  try {
    shipstats = await axios.get(Config.pa.dumps.ship_stats);
  } catch (error) {
    console.error(error);
  }
  if(shipstats?.status === 200 &&  shipstats?.data !== undefined) {
    let x2js = new X2JS();
    let json = x2js.xml2js(shipstats.data);
    // load each one in to the database
    let ship_id = 0;
    for (let json_ship of json["stats"]["ship"]) {
      let ship = new Ship(json_ship);
      ship._id = Mordor.Types.ObjectId();
      ship.ship_id = ship_id++; // set primary key
      let saved = await ship.save();
      if (saved) {
        console.log(`${saved.name} saved to Ships collection!`);
      } else {
        console.error(`${json_ship["name"]} could not be saved!`)
      }
    }
  }
};


let load_ticks = async(start) => {
  if(!await Tick.exists({ tick: 0 })) {
    await new Tick({ _id: Mordor.Types.ObjectId(), tick: 0, timestamp: start }).save();
    console.log("Added first tick!");
  } else {
    console.log("First tick already exists!");
  }
};


let setup_admin = async() => {
  if(!await User.exists({pa_nick: Config.admin.pa_nick})) {
    let adm = new User({
      _id: Mordor.Types.ObjectId(),
      pa_nick: Config.admin.pa_nick,
      access: 5
    });

    if(Config.admin.discord_id) {
      if(await DiscordUser.exists({dsuser_id: Config.admin.discord_id})) {
        adm.ds_user = await DiscordUser.findOne({dsuser_id: Config.admin.discord_id});
      }
      else {
        adm.ds_user = await new DiscordUser({
          _id: Mordor.Types.ObjectId(),
          dsuser_id: Config.admin.discord_id
        }).save();
      }
    }
    if(Config.admin.telegram_id) {
      if(await TelegramUser.exists({tguser_id: Config.admin.telegram_id})) {
        adm.tg_user = await TelegramUser.findOne({tguser_id: Config.admin.telegram_id});
      }
      else {
        adm.tg_user = await new TelegramUser({
          _id: Mordor.Types.ObjectId(),
          tguser_id: Config.admin.telegram_id
        }).save();
      }
    }

    try {
      await adm.save();
      console.log(`${Config.admin.pa_nick} saved to Users as Administrator`);
    } catch (error) {
      console.error(`${error}`)
    }
  }
};


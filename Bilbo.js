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
 * @name Bilbo.js
 * @version 2020/11/27
 * @summary Initialization
 **/
const Mordor = require('./Mordor');
const config = require('./config');
const bent = require('bent');
const getStream = bent('string');
const Ship = require('./models/ship.js');
const Member = require('./models/member.js');
const Tick = require('./models/tick.js');
const Theme = require('./models/theme.js');
const xmlParser = require('xml2json');

Mordor.connection.once("open", async() => {
  let stream = await getStream(config.pa.dumps.ship_stats);
  let json = JSON.parse(xmlParser.toJson(stream));
  await load_ships(json["stats"]["ship"]); // {"stats": { "ship": [ ... ]}}
  await load_ticks();
  await setup_admins();
  process.exit(0);
});


let load_ships = async(ships) => {
  // remove all the ships first
  await Ship.deleteMany({});

  // load each one
  let ship_id = 0;
  for (let json_ship of ships) {
    let ship = new Ship(json_ship);
    ship.id = ship_id++; // set primary key
    let saved = await ship.save();
    if (saved) {
      console.log(`${saved.name} saved to Ships collection!`);
    } else {
      console.error(`${json_ship["name"]} could not be saved!`)
    }
  }
};

let load_ticks = async() => {
  let ticks = await Tick.find();
  if (!ticks || ticks.length == 0) {
    await Tick.insertMany([{id: 0}]);
    console.log("Added first tick!");
  } else {
    console.log("First tick already exists!")
  }
};

let setup_admins = async() => {
  if (!await Member.exists({id: config.admin.id})) {
    if (await new Member({id: config.admin.id, access: 5, active: true}).save()) {
      console.log(`User id ${config.admin.id} saved to Members collection.`);
    } else {
      console.log(`Could not add admin to Members collection.`)
    }
  } else {
    console.log(`User id ${config.admin.id} already exists.`);
  }
};

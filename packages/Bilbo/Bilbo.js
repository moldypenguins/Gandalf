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
 * @version 2022-11-11
 * @summary setup
 * @param {string} -s,--start tick start date
 **/
'use strict';

const util = require('util');
const Config = require('config').get('config');
const dayjs = require('dayjs');
const bent = require('bent');
const getStream = bent('string');
const convert = require('xml-js');
const minimist = require('minimist');

const Mordor = require('./Mordor');
const Ship = require('./models/Ship');
const Tick = require('./models/Tick');


let argv = minimist(process.argv.slice(2), {
  string: ['start'],
  boolean: [],
  alias: {s:'start'},
  unknown: false
});

let _start = null;
Mordor.connection.once("open", async() => {
  if(!argv.start) {
    console.log(`A start date must be provided.`);
  }
  else {
    _start = dayjs(argv.start);
    if(_start > dayjs()) {
      await clear_database();
      await load_ships();
      await load_ticks(_start);
    }
  }
  process.exit(0);
});


let clear_database = async() => {
  await Ship.deleteMany({});
  await Tick.deleteMany({});

};

let load_ships = async() => {
  let stream = await getStream(Config.pa.dumps.ship_stats);
  let json = JSON.parse(convert.xml2json(stream, {
      compact: true,
      nativeType: false,
      spaces: 0,
      textFn: removeJsonTextAttribute
    }));
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
};

let load_ticks = async(start) => {
  if(!await Tick.exists({ tick: 0 })) {
    await new Tick({ _id: Mordor.Types.ObjectId(), tick: 0, timestamp: _start }).save();
    console.log("Added first tick!");
  } else {
    console.log("First tick already exists!");
  }
};


const nativeType = (value) => {
  let nValue = Number(value);
  if (!isNaN(nValue)) {
    return nValue;
  }
  let bValue = value.toLowerCase();
  if (bValue === 'true') {
    return true;
  } else if (bValue === 'false') {
    return false;
  }
  return value;
}

const removeJsonTextAttribute = (value, parentElement) => {
  try {
    let keyNo = Object.keys(parentElement._parent).length;
    let keyName = Object.keys(parentElement._parent)[keyNo - 1];
    parentElement._parent[keyName] = nativeType(value);
  }
  catch (e) {
    console.log(`Error: ${e}`);
  }
}
/**
 * Gandalf
 * Copyright (C) Gandalf Planetarion Tools
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
 * @version 2024/03/27
 * @summary Initialization
 * @param {string} -s,--start tick start date
 **/
'use strict';

const CFG = require('./Config');
const PA = require('./PA');
const FNCS = require('./Functions');
const Mordor = require('./Mordor');

const Ship = require('./models/Ship');
const Member = require('./models/Member');
const TelegramUser = require('./models/TelegramUser');
const Tick = require('./models/Tick');
const AttackTargetClaim = require('./models/AttackTargetClaim');
const AttackTarget = require('./models/AttackTarget');
const Attack = require('./models/Attack');
const BotMessage = require('./models/BotMessage');
const Intel = require('./models/Intel');
const Scan = require('./models/Scan');
const ScanRequest = require('./models/ScanRequest');
const PlanetScan = require('./models/ScanPlanet');
const DevelopmentScan = require('./models/ScanDevelopment');
const UnitScan = require('./models/ScanUnit');
const JumpGateProbe = require('./models/ScanJumpgate');
const PlanetDump = require('./models/PlanetDump');
const GalaxyDump = require('./models/GalaxyDump');
const AllianceDump = require('./models/AllianceDump');
const Planet = require('./models/Planet');
const Galaxy = require('./models/Galaxy');
const Cluster = require('./models/Cluster');
const Alliance = require('./models/Alliance');
const Applicant = require('./models/Applicant');
const GalMate = require('./models/GalMate');

const bent = require('bent');
const getStream = bent('string');
const xmlParser = require('xml2json');
const minimist = require('minimist');
const util = require('util');

const useragent = `{User-Agent: Bilbo/0.05 (admin ${CFG.admin.pa_nick})}`;

let argv = minimist(process.argv.slice(2), {
  string: ['start'],
  boolean: [],
  alias: {s:'start'},
  unknown: false
});

Mordor.connection.once("open", async() => {
  await clear_database();
  await load_ships();
  await load_ticks();
  await setup_admins();

  process.exit(0);
});


let clear_database = async() => {
  await Tick.deleteMany({});
  await Ship.deleteMany({});
  await AttackTargetClaim.deleteMany({});
  await AttackTarget.deleteMany({});
  await Attack.deleteMany({});
  await BotMessage.deleteMany({});
  await Intel.deleteMany({});
  await ScanRequest.deleteMany({});
  await Scan.deleteMany({});
  await PlanetScan.deleteMany({});
  await DevelopmentScan.deleteMany({});
  await UnitScan.deleteMany({});
  await JumpGateProbe.deleteMany({});
  await PlanetDump.deleteMany({});
  await GalaxyDump.deleteMany({});
  await AllianceDump.deleteMany({});
  await Planet.deleteMany({});
  await Galaxy.deleteMany({});
  await Cluster.deleteMany({});
  await Alliance.deleteMany({});
  await Applicant.deleteMany({});
  await GalMate.deleteMany({});

  await Member.updateMany({}, {$unset:{planet:""}})
};

let load_ships = async() => {
  let stream = await getStream(PA.dumps.ship_stats,useragent);
  let json = JSON.parse(xmlParser.toJson(stream));
  // load each one
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

let load_ticks = async() => {
  if (!await Tick.exists({tick:0})) {
    //TODO: fix argv.start
    let start = new Date(argv.start);
    console.log(`START: ${start}`);
    await new Tick({_id:Mordor.Types.ObjectId(), tick:0, timestamp:FNCS.isValidDate(start) ? start : null}).save();
    console.log("Added first tick!");
  } else {
    console.log("First tick already exists!");
  }
};

let setup_admins = async() => {
  if(!await TelegramUser.exists({telegram_id:CFG.admin.telegram_id})) {
    await new TelegramUser({_id:Mordor.Types.ObjectId(), telegram_id:CFG.admin.telegram_id}).save();
  }
  let tg_user = await TelegramUser.findOne({telegram_id:CFG.admin.telegram_id});
  console.log('TGUSER: ' + util.inspect(tg_user, false, null, true));

  if (!await Member.exists({telegram_user:tg_user})) {
    if (await new Member({_id:Mordor.Types.ObjectId(), telegram_user:tg_user, access: 5, pa_nick:CFG.admin.pa_nick}).save()) {
      console.log(`Added ${CFG.admin.pa_nick} as admin to Members collection.`);
    } else {
      console.log(`Could not add ${CFG.admin.pa_nick} as admin to Members collection.`);
    }
  } else {
    console.log(`Member ${CFG.admin.pa_nick} already exists.`);
  }
};

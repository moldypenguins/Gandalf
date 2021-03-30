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
const xmlParser = require('xml2json');
const Ship = require('./models/ship.js');
const Member = require('./models/member.js');
const Tick = require('./models/tick.js');
const AttackTargetClaim = require('./models/attack-target-claim.js');
const AttackTarget = require('./models/attack-target.js');
const Attack = require('./models/attack.js');
const BotMessage = require('./models/botmessage.js');
const Intel = require('./models/intel.js');
const Scan = require('./models/scan.js');
const ScanRequest = require('./models/scan-request.js');
const PlanetScan = require('./models/scan-planet.js');
const DevelopmentScan = require('./models/scan-development.js');
const UnitScan = require('./models/scan-unit.js');
const JumpGateProbe = require('./models/scan-jumpgate.js');
const PlanetDump = require('./models/planet-dump.js');
const GalaxyDump = require('./models/galaxy-dump.js');
const AllianceDump = require('./models/alliance-dump.js');
const Planet = require('./models/planet.js');
const Galaxy = require('./models/galaxy.js');
const Cluster = require('./models/cluster.js');
const Alliance = require('./models/alliance.js');
const Applicant = require('./models/applicant.js');
const GalMate = require('./models/galmate.js');


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

  await Member.updateMany({}, {planet_id:""})
};

let load_ships = async() => {
  let stream = await getStream(config.pa.dumps.ship_stats);
  let json = JSON.parse(xmlParser.toJson(stream));
  // load each one
  let ship_id = 0;
  for (let json_ship of json["stats"]["ship"]) {
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
    await Tick.insert({id: 0});
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

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
 * @name Frodo.js
 * @version 2021/06/07
 * @summary Ticker
 * @param {string} -h,--havoc start Frodo in havoc mode
**/
'use strict';

const CFG = require('./Config');
const PA = require('./PA');
const Functions = require('./Functions');
const Mordor = require('./Mordor');

const Tick = require('./models/Tick');
const Cluster = require('./models/Cluster');
const ClusterHistory = require('./models/PlanetHistory');
const Galaxy = require('./models/Galaxy');
const GalaxyDump = require('./models/GalaxyDump');
const GalaxyHistory = require('./models/PlanetHistory');
const Planet = require('./models/Planet');
const PlanetDump = require('./models/PlanetDump');
const PlanetHistory = require('./models/PlanetHistory');
const PlanetTrack = require('./models/PlanetTrack');
const Alliance = require('./models/Alliance');
const AllianceDump = require('./models/AllianceDump');
const AllianceHistory = require('./models/PlanetHistory');
const BotMessage = require('./models/BotMessage');
const Attack = require('./models/Attack');

const moment = require('moment');
const bent = require('bent');
const getStream = bent('string');
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
const minimist = require('minimist');
const util = require('util');
const crypto = require('crypto');


let argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['havoc', 'overwrite'],
  alias: {c:'havoc', o:'overwrite'},
  default: {'havoc':false, 'overwrite':false},
  unknown: false
});

if(argv.havoc) {
  rule.minute = [0, 15, 30, 45];
  rule.second = 30;
} else {
  rule.minute = 0;
  rule.second = 30;
}

const sleep = (ms) => {
  return new Promise(r => setTimeout(r, ms))
}

Mordor.connection.once("open", async () => {
  if(argv.havoc) { console.log("Havoc mode enabled."); }
  if(argv.overwrite) { console.log("Overwrite enabled."); }
  schedule.scheduleJob(rule, async () => {
    const start_time = new Date();
    console.log('Frodo Embarking on The Quest Of The Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);

    //get last tick
    let last_tick = (await Tick.findOne().sort({id: -1})).tick; //.findLastTick().tick;
    console.log('LAST_TICK: ' + util.inspect(last_tick, false, null, true));
    if(typeof(last_tick) !== 'undefined' || last_tick == null) {
      console.log('No ticks found in the database.');
      process.exit(0);
    } else {
      console.log('Last tick: ' + last_tick);
    }

    //start processing tick
    let stop_trying = false;
    while(!stop_trying) {
      let iteration_start = new Date();
      try {
        stop_trying = await process_tick(last_tick, start_time);
      } catch(error) {
        console.log(util.inspect(error, false, null, true));
        //break; //stop_trying = true;???
      }
      if(!stop_trying) {
        while((new Date()).getTime() - iteration_start.getTime() < 15) { //wait at least 15 seconds between each iteration
          await sleep(5 * 1000); //sleep for 5 seconds
        }
        if((new Date()).getTime() - start_time.getTime() < (argv.havoc ? start_time.getMinutes() + 10 : 55) * 60) { //give up after 55 minutes past the hour - havoc 10 minutes past the 15
          console.log(`Reached timeout without a successful dump, giving up!`);
          stop_trying = true;
        }
      }
    } //end while
  });
});




let process_tick = async (last_tick, start_time) => {
  let success = false;

  //get dump files
  console.log('Getting dump files...');
  let planet_dump = await getStream(PA.dumps.planet);
  let galaxy_dump = await getStream(PA.dumps.galaxy);
  let alliance_dump = await getStream(PA.dumps.alliance);
  let user_dump = await getStream(PA.dumps.user);
  console.log(`Loaded dumps from webserver in: ${(new Date()) - start_time}ms`);

  if(planet_dump !== undefined && galaxy_dump !== undefined && alliance_dump !== undefined && user_dump !== undefined) {
    planet_dump = planet_dump.split('\n');
    galaxy_dump = galaxy_dump.split('\n');
    alliance_dump = alliance_dump.split('\n');
    user_dump = user_dump.split('\n');

    if (planet_dump[3] !== galaxy_dump[3] || galaxy_dump[3] !== alliance_dump[3] || planet_dump[3] !== alliance_dump[3]) {
      throw new Error(`Varying ticks found - planet: ${planet_dump[3].match(/\d+/g).map(Number)[0]} - galaxy: ${galaxy_dump[3].match(/\d+/g).map(Number)[0]} - alliance: ${alliance_dump[3].match(/\d+/g).map(Number)[0]}.`);
    } else {
      let dump_tick = planet_dump[3].match(/\d+/g).map(Number)[0];

      if (!argv.overwrite && dump_tick <= last_tick) {
        throw new Error(`Stale tick found: pt${dump_tick}`);
      } else {
        //get current tick time
        //let tick_time = moment();
        //let remainder = tick_time.minute() % (argv.havoc ? 15 : 60);
        //tick_time.add(remainder, 'minutes');
        let tick_time = moment.utc().set({minute: (Math.floor(moment().minutes() / (argv.havoc ? 15 : 60)) * (argv.havoc ? 15 : 60)), second: 0, millisecond: 0});

        //create new tick
        let new_tick = await new Tick({
          _id:Mordor.Types.ObjectId(),
          tick: dump_tick,
          timestamp: tick_time
        });
        console.log(`Creating Tick: pt${new_tick.tick} - ${new_tick.timestamp}`);

        //##############################################################################################################
        //Dumps
        //##############################################################################################################

        //delete dump tables
        await PlanetDump.deleteMany();
        await GalaxyDump.deleteMany();
        await AllianceDump.deleteMany();
        console.log(`Deleted old dumps in: ${(new Date()) - start_time}ms`);

        //Planet Dumps
        if (planet_dump !== undefined && planet_dump != null) {
          for (let i = 8; i <= planet_dump.length; i++) {
            if (planet_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            } else {
              let p = planet_dump[i].split('\t');
              //console.log(util.inspect(p, false, null, true));
              await new PlanetDump({
                planet_id: p[0],
                x: Number(p[1]),
                y: Number(p[2]),
                z: Number(p[3]),
                planetname: p[4].replace(/"/g, ''),
                rulername: p[5].replace(/"/g, ''),
                race: p[6],
                size: Number(p[7] !== undefined ? p[7] : 0),
                score: Number(p[8] !== undefined ? p[8] : 0),
                value: Number(p[9] !== undefined ? p[9] : 0),
                xp: Number(p[10] !== undefined ? p[10] : 0)
              }).save();
            }
          }
          planet_dump = undefined;
        }

        //Galaxy Dumps
        if (galaxy_dump !== undefined && galaxy_dump != null) {
          for (let i = 8; i <= galaxy_dump.length; i++) {
            if (galaxy_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            } else {
              let g = galaxy_dump[i].split('\t');
              //console.log(util.inspect(g, false, null, true));
              await new GalaxyDump({
                x: Number(g[0]),
                y: Number(g[1]),
                name: g[2].replace(/"/g, ''),
                size: Number(g[3] !== undefined ? g[3] : 0),
                score: Number(g[4] !== undefined ? g[4] : 0),
                value: Number(g[5] !== undefined ? g[5] : 0),
                xp: Number(g[6] !== undefined ? g[6] : 0)
              }).save();
            }
          }
          galaxy_dump = undefined;
        }

        //Alliance Dumps
        if (alliance_dump !== undefined && alliance_dump != null) {
          for (let i = 8; i <= alliance_dump.length; i++) {
            if (alliance_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            } else {
              let a = alliance_dump[i].split('\t');
              //console.log(util.inspect(a, false, null, true));
              await new AllianceDump({
                score_rank: Number(a[0]),
                name: a[1].replace(/"/g, ''),
                size: Number(a[2] !== undefined ? a[2] : 0),
                members: Number(a[3] !== undefined ? a[3] : 1),
                score: Number(a[4] !== undefined ? a[4] : 0),
                points: Number(a[5] !== undefined ? a[5] : 0),
                size_avg: Number(a[2] !== undefined ? a[2] : 0) / Number(a[3] !== undefined ? a[3] : 1),
                score_avg: Number(a[4] !== undefined ? a[4] : 0) / Math.min(Number(a[3] !== undefined ? a[3] : 1), PA.numbers.tag_total),
                points_avg: Number(a[5] !== undefined ? a[5] : 0) / Number(a[3] !== undefined ? a[3] : 1)
              }).save();
            }
          }
          alliance_dump = undefined;
        }

        //User Dumps
        if (user_dump !== undefined && user_dump != null) {
          /*
          for (let i = 8; i <= user_dump.length; i++) {
            if (user_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            } else {
              let a = user_dump[i].split('\t');
              //console.log(util.inspect(a, false, null, true));
              await new UserDump({

              //TODO: add user dump handling

              }).save();
            }
          }
          */
          user_dump = undefined;
        }


        //##############################################################################################################
        console.log(`Inserted dumps in: ${(new Date()) - start_time}ms`);


        //##############################################################################################################
        //Clusters
        //##############################################################################################################
        //set all clusters to inactive
        await Cluster.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, galaxies: 0, planets: 0, ratio: 0});

        //loop through distinct x in galaxies
        let clusters = await GalaxyDump.find({}, {x: 1}).distinct('x');
        for (let c_temp in clusters) {
          //create cluster if not exists
          if (!await Cluster.exists({x: c_temp.x})) {
            await new Cluster({x: c_temp.x}).save();
          }
          //get cluster
          let cluster = await Cluster.findOne({x: c_temp.x});

          //aggregate galaxies
          let g = await GalaxyDump.aggregate([
            {$match: {x: cluster.x}},
            {
              $group: {
                _id: null,
                size: {$sum: '$size'},
                score: {$sum: '$score'},
                value: {$sum: '$value'},
                xp: {$sum: '$xp'},
                members: {$sum: 1}
              }
            }
          ]);
          //aggregate planets
          let p = await PlanetDump.aggregate([
            {$match: {x: cluster.x}},
            {
              $group: {
                _id: null,
                members: {$sum: 1}
              }
            }
          ]);
          //update cluster
          await Cluster.updateOne({x: cluster.x}, {
            size: g[0].size,
            score: g[0].score,
            value: g[0].value,
            xp: g[0].xp,
            active: true,
            age: cluster.age + 1 ?? 1,
            galaxies: g[0].members,
            planets: p[0].members,
            ratio: g[0].value !== 0 ? 10000.0 * g[0].size / g[0].value : 0,

            //TODO: add remaining fields

          });
        }
        //##############################################################################################################
        console.log(`Updated clusters in: ${(new Date()) - start_time}ms`);


        //##############################################################################################################
        //Galaxies
        //##############################################################################################################
        //set all galaxies to inactive
        await Galaxy.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, planets: 0, ratio: 0});

        //loop through galaxies
        let galaxies = await GalaxyDump.find({});
        for (let g_temp in galaxies) {
          //create galaxy if not exists
          if (!await Galaxy.exists({x: g_temp.x, y: g_temp.y})) {
            await new Galaxy({x: g_temp.x, y: g_temp.y}).save();
          }
          //get galaxy
          let galaxy = await Galaxy.findOne({x: g_temp.x, y: g_temp.y});

          //aggregate planets
          let p = await PlanetDump.aggregate([
            {$match: {x: galaxy.x, y: galaxy.y}},
            {
              $group: {
                _id: null,
                members: {$sum: 1}
              }
            }
          ]);

          //update galaxy
          await Galaxy.updateOne({x: galaxy.x, y: galaxy.y}, {
            size: g_temp.size,
            score: g_temp.score,
            value: g_temp.value,
            xp: g_temp.xp,
            active: true,
            age: galaxy.age + 1 ?? 1,
            planets: p[0].members,
            ratio: g_temp.value !== 0 ? 10000.0 * g_temp.size / g_temp.value : 0,

            //TODO: add remaining fields

          });
        }
        //##############################################################################################################
        console.log(`Updated galaxies in: ${(new Date()) - start_time}ms`);


        //##############################################################################################################
        //Planets
        //##############################################################################################################
        //set all planets to inactive
        await Planet.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, ratio: 0});

        //loop through planets
        let planets = await PlanetDump.find({});
        for (let p_temp in planets) {
          //create planet if not exists
          if (!await Planet.exists({planet_id: p_temp.planet_id})) {
            await new Planet({planet_id: p_temp.planet_id, x: p_temp.x, y: p_temp.y, z: p_temp.z, planetname: p_temp.planetname, rulername: p_temp.rulername, race: p_temp.race}).save();
            //track new planet
            await new PlanetTrack({planet_id: p_temp.planet_id, new_x: p_temp.x, new_y: p_temp.y, new_z: p_temp.z}).save();
          }
          //get planet
          let planet = await Planet.findOne({planet_id: p_temp.planet_id});

          //track renamed planet
          if (planet.rulername !== p_temp.rulername || planet.planetname !== p_temp.planetname) {
            await new PlanetTrack({planet_id: planet.planet_id, old_x: planet.x, old_y: planet.y, old_z: planet.z, new_x: p_temp.x, new_y: p_temp.y, new_z: p_temp.z}).save();
          }

          //track exiled planet
          if (planet.x !== p_temp.x || planet.y !== p_temp.y || planet.z !== p_temp.z) {
            await new PlanetTrack({planet_id: planet.planet_id, old_x: planet.x, old_y: planet.y, old_z: planet.z, new_x: p_temp.x, new_y: p_temp.y, new_z: p_temp.z}).save();
          }

          //update planet
          await Planet.updateOne({planet_id: planet.planet_id}, {
            x: p_temp.x,
            y: p_temp.y,
            z: p_temp.z,
            planetname: p_temp.planetname,
            rulername: p_temp.rulername,
            race: p_temp.race,
            size: p_temp.size,
            score: p_temp.score,
            value: p_temp.value,
            xp: p_temp.xp,
            active: true,
            age: planet.age + 1 ?? 1,
            ratio: p_temp.value !== 0 ? 10000.0 * p_temp.size / p_temp.value : 0,

            //TODO: add remaining fields

          });
        }

        //track deleted planets
        let deleted_planets = await Planet.find({active: false});
        for (let dp in deleted_planets) {
          await new PlanetTrack({planet_id: dp.planet_id, old_x: dp.x, old_y: dp.y, old_z: dp.z}).save();
          await Planet.deleteOne({planet_id: dp.planet_id});
        }


        //idle


        //value drops


        //landings


        //landed on

        //##############################################################################################################
        console.log(`Updated planets in: ${(new Date()) - start_time}ms`);


        //##############################################################################################################
        //Alliances
        //##############################################################################################################
        //set all alliances to inactive
        await Alliance.updateMany({}, {active: false, size: 0, score: 0, members: 0, points: 0, ratio: 0});

        //loop through alliances
        let alliances = await AllianceDump.find({});
        for (let a_temp in alliances) {
          //create alliance if not exists
          if (!await Alliance.exists({name: a_temp.name.trim()})) {
            await new Alliance({name: a_temp.name.trim()}).save();
          }
          //get alliance
          let alliance = await Alliance.findOne({name: a_temp.name.trim()});

          //update alliance
          await Alliance.updateOne({name: alliance.name}, {
            size: a_temp.size,
            score: a_temp.score,
            members: a_temp.members,
            points: a_temp.points,
            active: true,
            age: alliance.age + 1 ?? 1,
            ratio: a_temp.score !== 0 ? 10000.0 * a_temp.size / a_temp.score : 0,

            //TODO: add remaining fields

          });
        }
        //##############################################################################################################
        console.log(`Updated alliances in: ${(new Date()) - start_time}ms`);



        //##############################################################################################################
        //Save Tick
        //##############################################################################################################
        let cluster_count = await Cluster.aggregate([
          {$match: {active: {$eq: true}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let galaxy_count = await Galaxy.aggregate([
          {$match: {active: {$eq: true}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let planet_count = await Planet.aggregate([
          {$match: {active: {$eq: true}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let alliance_count = await Alliance.aggregate([
          {$match: {active: {$eq: true}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let c200_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, x: {$eq: 200}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let ter_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, race: {$regex: /^ter$/i}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let cat_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, race: {$regex: /^cat$/i}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let xan_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, race: {$regex: /^xan$/i}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let zik_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, race: {$regex: /^zik$/i}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);
        let etd_count = await Planet.aggregate([
          {$match: {active: {$eq: true}, race: {$regex: /^etd$/i}}},
          {$group: {_id: null, count: {$sum: 1}}}
        ]);

        new_tick.clusters = typeof (cluster_count[0]) != 'undefined' ? cluster_count[0].count : 0;
        new_tick.galaxies = typeof (galaxy_count[0]) != 'undefined' ? galaxy_count[0].count : 0;
        new_tick.planets = typeof (planet_count[0]) != 'undefined' ? planet_count[0].count : 0;
        new_tick.alliances = typeof (alliance_count[0]) != 'undefined' ? alliance_count[0].count : 0;
        new_tick.c200 = typeof (c200_count[0]) != 'undefined' ? c200_count[0].count : 0;
        new_tick.ter = typeof (ter_count[0]) != 'undefined' ? ter_count[0].count : 0;
        new_tick.cat = typeof (cat_count[0]) != 'undefined' ? cat_count[0].count : 0;
        new_tick.xan = typeof (xan_count[0]) != 'undefined' ? xan_count[0].count : 0;
        new_tick.zik = typeof (zik_count[0]) != 'undefined' ? zik_count[0].count : 0;
        new_tick.etd = typeof (etd_count[0]) != 'undefined' ? etd_count[0].count : 0;

        let this_tick = await new_tick.save();
        //##############################################################################################################
        console.log(`Updated tick stats in: ${(new Date()) - start_time}ms\n`);
        console.log(`pt${this_tick.id} saved to Ticks collection.`);



        //##############################################################################################################
        //History
        //##############################################################################################################
        clusters = await Cluster.find({active: true});
        for(let c in clusters) {
          await new ClusterHistory({
            tick: this_tick._id,
            x:c.x,
            size:c.size,
            score:c.score,
            value:c.value,
            xp:c.xp,
            active:c.active,
            age:c.age,
            galaxies:c.galaxies,
            planets:c.planets,
            ratio:c.ratio,
          });
        }
        galaxies = await Galaxy.find({active: true});
        for(let g in galaxies) {
          await new GalaxyHistory({
            tick: this_tick._id,
            x:g.x,
            y:g.y,
            name:g.name,
            size:g.size,
            score:g.score,
            value:g.value,
            xp:g.xp,
            active:g.active,
            age:g.age,
            planets:g.planets,
            ratio:g.ratio,
          });
        }
        planets = await Planet.find({active: true});
        for(let p in planets) {
          await new PlanetHistory({
            tick: this_tick._id,
            x:p.x,
            y:p.y,
            z:p.z,
            name:p.name,
            size:p.size,
            score:p.score,
            value:p.value,
            xp:p.xp,
            active:p.active,
            age:p.age,
            galaxies:p.galaxies,
            planets:p.planets,
            ratio:p.ratio,
          });
        }
        alliances = await Alliance.find({active: true});
        for(let a in alliances) {
          await new AllianceHistory({
            tick: this_tick._id,
            name:a.name,
            size:a.size,
            score:a.score,
            points:a.points,
            active:a.active,
            age:a.age,
            alias: a.alias,
            members:a.members,
            ratio:a.ratio,
          });
        }
        //##############################################################################################################
        console.log(`Updated history in: ${(new Date()) - start_time}ms`);



        //##############################################################################################################
        //Dicks
        //##############################################################################################################



        //##############################################################################################################
        console.log(`Total time on dicks: ${(new Date()) - start_time}ms`);



        //##############################################################################################################
        //Send Message
        //##############################################################################################################
        let txt = `pt<b>${this_tick.id}</b> ${moment(this_tick.timestamp).utc().format('H:mm')} <i>GMT</i>`;
        let atts = await Attack.find({releasetick: this_tick.id});
        for (let m = 0; m < atts.length; m++) {
          txt += `\n<b>Attack ${atts[m].id}</b> released. <a href="${CFG.web.uri}/att/${atts[m].hash}">Claim Targets</a>`;
        }
        //console.log(util.inspect('TEXT: ' + txt, false, null, true));
        if (CFG.bot.tick_alert || atts.length > 0) {
          await new BotMessage({
            id: crypto.randomBytes(8).toString("hex"),
            group_id: CFG.groups.private,
            message: txt,
            sent: false
          }).save();
          console.log(`Sent Message: "${txt}"`);
        }
        success = true;
      }
    }
  }
  return success;
}

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
 * @name frodo.js
 * @version 2023-01-16
 * @summary Ticker
 * @param {string} -h,--havoc start Frodo in havoc mode
 * @param {flag} -f,--force force to start now
 * @param {flag} -o,--overwrite overwrite current tick
 **/



import Config from 'galadriel';
import {
  Mordor,
  Tick,
  Planet, PlanetDump, PlanetHistory, PlanetTrack,
  Galaxy, GalaxyDump, GalaxyHistory,
  Alliance, AllianceDump, AllianceHistory,
  Cluster, ClusterHistory
} from 'mordor';
import axios from 'axios';
import schedule from 'node-schedule';
import minimist from 'minimist';
import util from 'util';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const rule = new schedule.RecurrenceRule();


let argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['havoc', 'force', 'overwrite'],
  alias: {c:'havoc', f:'force', o:'overwrite'},
  default: {'havoc':false, 'force':false, 'overwrite':false},
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
  if(argv.havoc) { console.log("Havoc enabled."); }
  if(argv.force) { console.log("Force enabled."); argv.force = new Date(); argv.force.setSeconds(argv.force.getSeconds() + 15); }
  if(argv.overwrite) { console.log("Overwrite enabled."); }

  schedule.scheduleJob(argv.force ? argv.force : rule, async (fire_time) => {
    const start_time = new Date();
    console.log('Frodo Embarking on The Quest Of The Ring.');
    console.log(`Job Time: ${dayjs(fire_time).format('YYYY-MM-DD H:mm:ss')}`);
    console.log(`Start Time: ${dayjs(start_time).format('YYYY-MM-DD H:mm:ss')}`);

    //get last tick
    let last_tick = (await Tick.findLastTick()).tick;
    if(typeof(last_tick) === 'undefined' || last_tick === null) {
      console.log('No ticks found in the database.');
      process.exit(0);
    } else {
      console.log('Last tick: ' + last_tick);
    }

    //start processing tick
    let stop_trying = false;
    while(!stop_trying) {
      let iteration_start = new Date();
      let {success, error} = await process_tick(last_tick, start_time);
      if(error) {
        console.error(`${error}\nUnable to process tick, giving up!\n\n`);
        stop_trying = true;
      }
      if(!success) {
        while((new Date()).getTime() - iteration_start.getTime() < 15) { //wait at least 15 seconds between each iteration
          await sleep(5 * 1000); //sleep for 5 seconds
        }
        if((new Date()).getTime() - start_time.getTime() < (argv.havoc ? start_time.getMinutes() + 10 : 55) * 60) { //give up after 55 minutes past the hour - havoc 10 minutes past the 15
          console.warn(`Reached timeout without a successful dump, giving up!\n\n`);
          stop_trying = true;
        }
      }
      else {
        stop_trying = true;
      }
    } //end while
  });
});




let process_tick = async (last_tick, start_time) => {
  let success = false;
  let error = null;
  let current_ms = 0;
  let total_ms = 0;

  //get dump files
  console.log('Getting dump files...');
  let planet_dump, galaxy_dump, alliance_dump, user_dump;
  try {
    [ planet_dump, galaxy_dump, alliance_dump, user_dump ] = await Promise.all([
      axios.get(Config.pa.dumps.planet),
      axios.get(Config.pa.dumps.galaxy),
      axios.get(Config.pa.dumps.alliance),
      axios.get(Config.pa.dumps.user)
    ]);
  }
  catch(err) {
    error = err;
  }

  if(
    planet_dump?.status === 200 && planet_dump.data &&
    galaxy_dump?.status === 200 && galaxy_dump.data &&
    alliance_dump?.status === 200 && alliance_dump.data &&
    user_dump?.status === 200 && user_dump.data
  ) {
    current_ms = (new Date()) - start_time;
    console.log(`Loaded dumps from webserver in: ${current_ms - total_ms}ms`);
    total_ms += current_ms - total_ms;

    planet_dump = planet_dump.data.split('\n');
    galaxy_dump = galaxy_dump.data.split('\n');
    alliance_dump = alliance_dump.data.split('\n');
    user_dump = user_dump.data.split('\n');

    if(planet_dump[3] !== galaxy_dump[3] || galaxy_dump[3] !== alliance_dump[3] || planet_dump[3] !== alliance_dump[3]) {
      throw new Error(`Varying ticks found - planet: ${planet_dump[3].match(/\d+/g).map(Number)[0]} - galaxy: ${galaxy_dump[3].match(/\d+/g).map(Number)[0]} - alliance: ${alliance_dump[3].match(/\d+/g).map(Number)[0]}.`);
    }
    else {
      let dump_tick = planet_dump[3].match(/\d+/g).map(Number)[0];

      if(!argv.overwrite && dump_tick <= last_tick) {
        throw new Error(`Stale tick found: pt${dump_tick}`);
      }
      else {
        //get or create tick object
        let new_tick;
        if(dump_tick <= last_tick) {
          new_tick = await Tick.findOne({tick: dump_tick});
          console.log(`Updating Tick: pt${new_tick.tick} - ${dayjs(new_tick.timestamp).tz().format('YYYY-MM-dd HH:mm z')}`);
        }
        else {
          new_tick = await new Tick({
            _id: Mordor.Types.ObjectId(),
            tick: dump_tick,
            timestamp: dayjs().utc().minute(Math.floor(dayjs().minute() / (argv.havoc ? 15 : 60)) * (argv.havoc ? 15 : 60)).second(0).millisecond(0)
          });
          console.log(`Creating Tick: pt${new_tick.tick} - ${dayjs(new_tick.timestamp).tz().format('YYYY-MM-dd HH:mm z')}`);
        }

        //##############################################################################################################
        //Dumps
        //##############################################################################################################
        //delete dump tables
        await PlanetDump.deleteMany();
        await GalaxyDump.deleteMany();
        await AllianceDump.deleteMany();
        //await UserFeed.deleteMany();
        current_ms = (new Date()) - start_time;
        console.log(`Cleaned old dumps in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;

        //Planet Dumps
        if(planet_dump !== undefined && planet_dump != null) {
          for(let i = 8; i <= planet_dump.length; i++) {
            if(planet_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            }
            else {
              let p = planet_dump[i].split('\t');
              //console.log(util.inspect(p, false, null, true));
              await new PlanetDump({
                _id: Mordor.Types.ObjectId(),
                planet_id: p[0],
                x: Number(p[1]),
                y: Number(p[2]),
                z: Number(p[3]),
                planetname: p[4].replace(/"/g, ''),
                rulername: p[5].replace(/"/g, ''),
                race: p[6],
                size: Number(p[7] ?? 0),
                score: Number(p[8] ?? 0),
                value: Number(p[9] ?? 0),
                xp: Number(p[10] ?? 0),
                special: p[11] ?? p[11].replace(/"/g, ''),
              }).save();
            }
          }
          planet_dump = undefined;
        }

        //Galaxy Dumps
        if(galaxy_dump !== undefined && galaxy_dump != null) {
          for(let i = 8; i <= galaxy_dump.length; i++) {
            if(galaxy_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            }
            else {
              let g = galaxy_dump[i].split('\t');
              //console.log(util.inspect(g, false, null, true));
              await new GalaxyDump({
                _id: Mordor.Types.ObjectId(),
                x: Number(g[0]),
                y: Number(g[1]),
                name: g[2].replace(/"/g, ''),
                size: Number(g[3] ?? 0),
                score: Number(g[4] ?? 0),
                value: Number(g[5] ?? 0),
                xp: Number(g[6] ?? 0)
              }).save();
            }
          }
          galaxy_dump = undefined;
        }

        //Alliance Dumps
        if(alliance_dump !== undefined && alliance_dump != null) {
          for(let i = 8; i <= alliance_dump.length; i++) {
            if(alliance_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            }
            else {
              let a = alliance_dump[i].split('\t');
              //console.log(util.inspect(a, false, null, true));
              await new AllianceDump({
                _id:Mordor.Types.ObjectId(),
                rank: Number(a[0]),
                name: a[1].replace(/"/g, ''),
                size: Number(a[2] ?? 0),
                members: Number(a[3] ?? 1),
                counted_score: Number(a[4] ?? 0),
                points: Number(a[5] ?? 0),
                total_score: Number(a[6] ?? 0),
                total_value: Number(a[7] ?? 0),
              }).save();
            }
          }
          alliance_dump = undefined;
        }

        //User Dumps
        /*
        if(user_dump !== undefined && user_dump != null) {
          for(let i = 8; i <= user_dump.length; i++) {
            if(user_dump[i] === 'EndOfPlanetarionDumpFile') {
              break;
            }
            else {
              let u = user_dump[i].split('\t');
              //console.log(util.inspect(u, false, null, true));
              await new UserDump({
                _id: Mordor.Types.ObjectId(),
                tick: Number(u[0]),
                type: u[1].replace(/"/g, ''),
                text: u[2].replace(/"/g, ''),
              }).save();
            }
          }
          user_dump = undefined;
        }
        */

        //##############################################################################################################
        current_ms = (new Date()) - start_time;
        console.log(`Refreshed dumps in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Clusters
        //##############################################################################################################

        //set all clusters to inactive
        await Cluster.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, galaxies: 0, planets: 0, ratio: 0});

        //loop through distinct x in galaxies
        let clusters = await GalaxyDump.find({}, {x: 1}).distinct('x');
        //console.log(`CLUSTERS: ` + util.inspect(clusters, true, null, true));

        for (let c_temp in clusters) {
          //create cluster if not exists
          if (!await Cluster.exists({x: clusters[c_temp]})) {
            await new Cluster({_id:Mordor.Types.ObjectId(), x: clusters[c_temp]}).save();
          }

          //get cluster
          let cluster = await Cluster.findOne({x: clusters[c_temp]});
          //console.log(`CLUSTER: ` + util.inspect(cluster, true, null, true));

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

        current_ms = (new Date()) - start_time;
        console.log(`Updated clusters in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Galaxies
        //##############################################################################################################

        //set all galaxies to inactive
        await Galaxy.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, planets: 0, ratio: 0});

        //loop through galaxies
        let galaxies = await GalaxyDump.find({});
        //console.log(`GALAXIES: ` + util.inspect(galaxies, true, null, true));

        for (let g_temp in galaxies) {
          //create galaxy if not exists
          if (!await Galaxy.exists({x:galaxies[g_temp].x, y:galaxies[g_temp].y})) {
            await new Galaxy({_id:Mordor.Types.ObjectId(), x:galaxies[g_temp].x, y:galaxies[g_temp].y, name:galaxies[g_temp].name}).save();
          }
          //get galaxy
          let galaxy = await Galaxy.findOne({x: galaxies[g_temp].x, y: galaxies[g_temp].y});

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

          //console.log(`GALAXY: ` + util.inspect(galaxy, true, null, true));

          //update galaxy
          await Galaxy.updateOne({x: galaxy.x, y: galaxy.y}, {
            name: galaxies[g_temp].name,
            size: galaxies[g_temp].size,
            score: galaxies[g_temp].score,
            value: galaxies[g_temp].value,
            xp: galaxies[g_temp].xp,
            active: true,
            age: galaxy.age + 1 ?? 1,
            planets: p[0].members,
            ratio: galaxies[g_temp].value !== 0 ? 10000.0 * galaxies[g_temp].size / galaxies[g_temp].value : 0,

            //TODO: add remaining fields

          });
        }

        current_ms = (new Date()) - start_time;
        console.log(`Updated galaxies in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Planets
        //##############################################################################################################

        //set all planets to inactive
        await Planet.updateMany({}, {active: false, size: 0, score: 0, value: 0, xp: 0, ratio: 0});

        //loop through planets
        let planets = await PlanetDump.find({});
        //console.log(`PLANETS: ` + util.inspect(planets, true, null, true));

        for (let p_temp in planets) {
          //console.log('PTEMP: ' + util.inspect(planets[p_temp], true, null, true));

          //create planet if not exists
          if (!await Planet.exists({planet_id: planets[p_temp].planet_id})) {
            await new Planet({_id:Mordor.Types.ObjectId(), planet_id: planets[p_temp].planet_id, x: planets[p_temp].x, y: planets[p_temp].y, z: planets[p_temp].z, planetname: planets[p_temp].planetname, rulername: planets[p_temp].rulername, race: planets[p_temp].race}).save();
            //track new planet
            await new PlanetTrack({_id:Mordor.Types.ObjectId(), planet_id: planets[p_temp].planet_id, new_x: planets[p_temp].x, new_y: planets[p_temp].y, new_z: planets[p_temp].z}).save();
          }
          //get planet
          let planet = await Planet.findOne({planet_id: planets[p_temp].planet_id});

          //track renamed planet
          if (planet.rulername !== planets[p_temp].rulername || planet.planetname !== planets[p_temp].planetname) {
            await new PlanetTrack({_id:Mordor.Types.ObjectId(), planet_id: planet.planet_id, old_x: planet.x, old_y: planet.y, old_z: planet.z, new_x: planets[p_temp].x, new_y: planets[p_temp].y, new_z: planets[p_temp].z}).save();
          }

          //track exiled planet
          if (planet.x !== planets[p_temp].x || planet.y !== planets[p_temp].y || planet.z !== planets[p_temp].z) {
            await new PlanetTrack({_id:Mordor.Types.ObjectId(), planet_id: planet.planet_id, old_x: planet.x, old_y: planet.y, old_z: planet.z, new_x: planets[p_temp].x, new_y: planets[p_temp].y, new_z: planets[p_temp].z}).save();
          }

          //update planet
          await Planet.updateOne({planet_id: planet.planet_id}, {
            x: planets[p_temp].x,
            y: planets[p_temp].y,
            z: planets[p_temp].z,
            planetname: planets[p_temp].planetname,
            rulername: planets[p_temp].rulername,
            race: planets[p_temp].race,
            size: planets[p_temp].size,
            score: planets[p_temp].score,
            value: planets[p_temp].value,
            xp: planets[p_temp].xp,
            active: true,
            age: planet.age + 1 ?? 1,
            ratio: planets[p_temp].value !== 0 ? 10000.0 * planets[p_temp].size / planets[p_temp].value : 0,
            size_rank:  await PlanetDump.find({size:{$gt:planets[p_temp].size},x:{$ne:200}}).countDocuments() + 1,
            score_rank: await PlanetDump.find({score:{$gt:planets[p_temp].score},x:{$ne:200}}).countDocuments() + 1,
            value_rank: await PlanetDump.find({value:{$gt:planets[p_temp].value},x:{$ne:200}}).countDocuments() + 1,
            xp_rank:    await PlanetDump.find({xp:{$gt:planets[p_temp].xp},x:{$ne:200}}).countDocuments() + 1,

            //TODO: add remaining fields

          });
        }

        //track deleted planets
        let deleted_planets = await Planet.find({active: false});
        for (let dp in deleted_planets) {
          await new PlanetTrack({_id:Mordor.Types.ObjectId(), planet_id: dp.planet_id, old_x: dp.x, old_y: dp.y, old_z: dp.z}).save();
          await Planet.deleteOne({planet_id: dp.planet_id});
        }


        //idle


        //value drops


        //landings


        //landed on




        current_ms = (new Date()) - start_time;
        console.log(`Updated planets in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Alliances
        //##############################################################################################################

        //set all alliances to inactive
        await Alliance.updateMany({}, {active: false, size: 0, score: 0, members: 0, points: 0, ratio: 0});

        //loop through alliances
        let alliances = await AllianceDump.find({});
        for (let a_temp in alliances) {
          //create alliance if not exists
          if (!await Alliance.exists({name: alliances[a_temp].name.trim()})) {
            await new Alliance({_id:Mordor.Types.ObjectId(), name: alliances[a_temp].name.trim()}).save();
          }
          //get alliance
          let alliance = await Alliance.findOne({name: alliances[a_temp].name.trim()});

          //update alliance
          await Alliance.updateOne({name: alliance.name}, {
            size: alliances[a_temp].size,
            score: alliances[a_temp].score,
            members: alliances[a_temp].members,
            points: alliances[a_temp].points,
            active: true,
            age: alliance.age + 1 ?? 1,
            ratio: alliances[a_temp].score !== 0 ? 10000.0 * alliances[a_temp].size / alliances[a_temp].score : 0,

            //TODO: add remaining fields

          });
        }

        current_ms = (new Date()) - start_time;
        console.log(`Updated alliances in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Tick Statistics
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
        console.log(`pt${this_tick.tick} saved to Ticks collection.`);

        current_ms = (new Date()) - start_time;
        console.log(`Updated tick stats in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //History
        //##############################################################################################################

        clusters = await Cluster.find({active: true});
        for(let c in clusters) {
          await new ClusterHistory({
            _id:Mordor.Types.ObjectId(),
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
            _id:Mordor.Types.ObjectId(),
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
            _id:Mordor.Types.ObjectId(),
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
            _id:Mordor.Types.ObjectId(),
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

        current_ms = (new Date()) - start_time;
        console.log(`Updated history in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Dicks
        //##############################################################################################################




        current_ms = (new Date()) - start_time;
        console.log(`Updated dicks in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;


        //##############################################################################################################
        //Send Message
        //##############################################################################################################

        /*
        let txt = `pt<b>${this_tick.tick}</b> ${moment(this_tick.timestamp).utc().format('H:mm')} <i>GMT</i>`;
        let atts = await Attack.find({releasetick: this_tick.tick});
        for (let m = 0; m < atts.length; m++) {
          txt += `\n<b>Attack ${atts[m].id}</b> released. <a href="${CFG.web.uri}/att/${atts[m].hash}">Claim Targets</a>`;
        }
        //console.log(util.inspect('TEXT: ' + txt, false, null, true));
        if (CFG.bot.tick_alert || atts.length > 0) {
          await new BotMessage({
            _id:Mordor.Types.ObjectId(),
            message_id: crypto.randomBytes(8).toString("hex"),
            group_id: CFG.groups.private,
            message: txt,
            sent: false
          }).save();
          console.log(`Sent Message: "${txt}"`);
        }
        */

        current_ms = (new Date()) - start_time;
        console.log(`Quest completed successfully in: ${current_ms}ms!\n\n`);
        success = true;
      }
    }
  }
  return {success, error};
}

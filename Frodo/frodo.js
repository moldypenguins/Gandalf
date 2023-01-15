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
 * @version 2022-11-11
 * @summary Ticker
 * @param {string} -h,--havoc start Frodo in havoc mode
 * @param {flag} -f,--force force to start now
 * @param {flag} -o,--overwrite overwrite current tick
 **/



import Config from 'galadriel';
import { Mordor, Tick, PlanetDump, GalaxyDump, AllianceDump } from 'mordor';
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





        //##############################################################################################################
        //Galaxies
        //##############################################################################################################



        //##############################################################################################################
        //Planets
        //##############################################################################################################







        //##############################################################################################################
        //Alliances
        //##############################################################################################################




        //##############################################################################################################
        //Tick Statistics
        //##############################################################################################################




        let this_tick = await new_tick.save();
        console.log(`pt${this_tick.tick} saved to Ticks collection.`);
        //##############################################################################################################
        current_ms = (new Date()) - start_time;
        console.log(`Updated tick stats in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;




        //##############################################################################################################
        //History
        //##############################################################################################################







        //##############################################################################################################
        //Dicks
        //##############################################################################################################







        //##############################################################################################################
        //Send Message
        //##############################################################################################################





        current_ms = (new Date()) - start_time;
        console.log(`Quest completed successfully in: ${current_ms}ms!\n\n`);
        success = true;
      }
    }
  }
  return {success, error};
}

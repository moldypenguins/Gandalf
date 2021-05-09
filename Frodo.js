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
 * @version 2020/11/19
 * @summary Ticker
**/
const Mordor = require('./Mordor');
const config = require('./config');
const Ship = require('./models/ship');
const Member = require('./models/member');
const Tick = require('./models/tick');
const PlanetDump = require('./models/planet-dump');
const GalaxyDump = require('./models/galaxy-dump');
const AllianceDump = require('./models/alliance-dump');
const Cluster = require('./models/cluster');
const Galaxy = require('./models/galaxy');
const Planet = require('./models/planet');
const Alliance = require('./models/alliance');
const BotMessage = require('./models/botmessage');
const Attack = require('./models/attack');
const path = require("path");
const fs = require('fs');
const bent = require('bent');
const getStream = bent('string');
const moment = require('moment');
const util = require('util');
const crypto = require('crypto');
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();


//use command line args for havoc flag
const havoc = false;

if(havoc) {
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
  let j = schedule.scheduleJob(rule, async () => {
    const start_time = new Date();
    console.log('Frodo Embarking on The Quest Of The Ring.');
    console.log(`Start Time: ${moment(start_time).format('YYYY-MM-DD H:mm:ss')}`);

    let stop_trying = false;
    while(!stop_trying) {
      let iteration_start = new Date();
      try {
        //get last tick
        let lasttick = await Tick.findOne().sort({id: -1});
        if(typeof(lasttick) == 'undefined') {
          console.log('No ticks.');
        } else {
          console.log('Last tick: ' + lasttick.id);
          console.log('Getting dump files...');
          //get dump files
          let planet_dump = await getStream(config.pa.dumps.planet);
          let galaxy_dump = await getStream(config.pa.dumps.galaxy);
          let alliance_dump = await getStream(config.pa.dumps.alliance);
          let user_dump = await getStream(config.pa.dumps.user);
          console.log(`Loaded dumps from webserver in: ${(new Date()) - start_time}ms`);
          
          if(planet_dump !== undefined && galaxy_dump !== undefined && alliance_dump !== undefined && user_dump !== undefined) {
            planet_dump = planet_dump.split('\n');
            galaxy_dump = galaxy_dump.split('\n');
            alliance_dump = alliance_dump.split('\n');
            user_dump = user_dump.split('\n');
            
            //let tick_time = moment.utc().set({minute:(Math.floor(moment().minutes() / 15) * 15),second:0,millisecond:0});
            
            if(planet_dump[3] !== galaxy_dump[3] || galaxy_dump[3] !== alliance_dump[3] || planet_dump[3] !== alliance_dump[3]) {
              console.log(`Varying ticks found - planet: ${planet_dump[3].match(/\d+/g).map(Number)[0]} - galaxy: ${galaxy_dump[3].match(/\d+/g).map(Number)[0]} - alliance: ${alliance_dump[3].match(/\d+/g).map(Number)[0]}.`);
            } else {
              let dump_tick = planet_dump[3].match(/\d+/g).map(Number)[0];
              
              if(dump_tick <= lasttick.id) {
                console.log(`Stale tick found (pt${dump_tick})`);
                return;
              } else {
                await process_tick(planet_dump, galaxy_dump, alliance_dump, user_dump, start_time);
                stop_trying = true;
              }
            }
          }
        }
      } catch(error) {
        console.log(util.inspect(error, false, null, true));
        break;
      }
      if(!stop_trying) {
        while((new Date()).getTime() - iteration_start.getTime() < 15) { //wait 15 seconds between each try
          await sleep(5 * 1000); //sleep for 5 seconds
        }
        if((new Date()).getTime() - start_time.getTime() < (havoc ? start_time.getMinutes() + 10 : 55) * 60) { //give up after 55 minutes past the hour - havoc 10 minutes past the 15
          console.log(`Reached timeout without a successful dump, giving up!`);
          stop_trying = true;
        }
      }
    } //end while

  });
});




let process_tick = async (planet_dump, galaxy_dump, alliance_dump, user_dump, start_time) => {
  //get current tick time
  let tick_time = moment();
  let remainder = tick_time.minute() % (havoc ? 15 : 60);
  tick_time.add(remainder, 'minutes');
  //add tick to db
  let new_tick = new Tick({
    id: planet_dump[3].match(/\d+/g).map(Number)[0],
    timestamp: tick_time
  });

  //delete dump tables
  await PlanetDump.deleteMany();
  await GalaxyDump.deleteMany();
  await AllianceDump.deleteMany();
  console.log(`Deleted old dumps in: ${(new Date()) - start_time}ms`);

  if (new_tick.id < config.pa.tick.shuffle) {
    console.log('Pre-shuffle dumps detected, dumping data.');
    planet_dump = undefined;
    galaxy_dump = undefined;
    alliance_dump = undefined;
  }
  //Planets
  if (planet_dump !== undefined && planet_dump != null) {
    for (let i = 8; i <= planet_dump.length; i++) {
      if (planet_dump[i] === 'EndOfPlanetarionDumpFile') {
        break;
      } else {
        let p = planet_dump[i].split('\t');
        //console.log(util.inspect(p, false, null, true));
        let p_dump = new PlanetDump({
          id: p[0],
          x: Number(p[1]),
          y: Number(p[2]),
          z: Number(p[3]),
          planetname: p[4].replace(/\"/g, ''),
          rulername: p[5].replace(/\"/g, ''),
          race: p[6],
          size: Number(p[7] !== undefined ? p[7] : 0),
          score: Number(p[8] !== undefined ? p[8] : 0),
          value: Number(p[9] !== undefined ? p[9] : 0),
          xp: Number(p[10] !== undefined ? p[10] : 0)
        });
        await p_dump.save();
      }
    }
    planet_dump = undefined;
    //console.log('Planet dumps inserted in: ${(new Date()) - start_time}ms');
  }
  //Galaxies
  if (galaxy_dump !== undefined && galaxy_dump != null) {
    for (let i = 8; i <= galaxy_dump.length; i++) {
      if (galaxy_dump[i] === 'EndOfPlanetarionDumpFile') {
        break;
      } else {
        let g = galaxy_dump[i].split('\t');
        //console.log(util.inspect(g, false, null, true));
        let g_dump = new GalaxyDump({
          x: Number(g[0]),
          y: Number(g[1]),
          name: g[2].replace(/\"/g, ''),
          size: Number(g[3] !== undefined ? g[3] : 0),
          score: Number(g[4] !== undefined ? g[4] : 0),
          value: Number(g[5] !== undefined ? g[5] : 0),
          xp: Number(g[6] !== undefined ? g[6] : 0)
        });
        await g_dump.save();
      }
    }
    galaxy_dump = undefined;
    //console.log('Galaxy dumps inserted in: ${(new Date()) - start_time}ms');
  }
  //Alliances
  if (alliance_dump !== undefined && alliance_dump != null) {
    for (let i = 8; i <= alliance_dump.length; i++) {
      if (alliance_dump[i] === 'EndOfPlanetarionDumpFile') {
        break;
      } else {
        let a = alliance_dump[i].split('\t');
        //console.log(util.inspect(a, false, null, true));
        let a_dump = new AllianceDump({
          score_rank: Number(a[0]),
          name: a[1].replace(/\"/g, ''),
          size: Number(a[2] !== undefined ? a[2] : 0),
          members: Number(a[3] !== undefined ? a[3] : 1),
          score: Number(a[4] !== undefined ? a[4] : 0),
          points: Number(a[5] !== undefined ? a[5] : 0),
          size_avg: Number(a[2] !== undefined ? a[2] : 0) / Number(a[3] !== undefined ? a[3] : 1),
          score_avg: Number(a[4] !== undefined ? a[4] : 0) / Math.min(Number(a[3] !== undefined ? a[3] : 1), config.pa.numbers.tag_total),
          points_avg: Number(a[5] !== undefined ? a[5] : 0) / Number(a[3] !== undefined ? a[3] : 1)
        });
        await a_dump.save();
      }
    }
    alliance_dump = undefined;
    //console.log('Alliance dumps inserted in: ${(new Date()) - start_time}ms');
  }

  user_dump = undefined; //not used

  console.log(`Inserted dumps in: ${(new Date()) - start_time}ms`);

  //##############
  //Clusters
  //##############
  await Cluster.updateMany({}, {active: true});

  let clusters = await Cluster.find({}, 'x');

  let cluster_temp = await GalaxyDump.find({x: {$nin: clusters.map(c => c.x)}}, 'x').distinct('x');
  for (let ckey in cluster_temp) {
    //console.log(util.inspect(ckey, false, null, true));
    let clstr = new Cluster({
      x: cluster_temp[ckey],
      active: true
    });
    await clstr.save();
  }

  cluster_temp = await GalaxyDump.find();
  let cupdcount = await Cluster.updateMany({x: {$nin: cluster_temp.map(c => c.x)}}, {active: false});
  //console.log('Clusters set inactive: ' + util.inspect(cupdcount, false, null, true));

  clusters = await Cluster.find({active: true});
  for (let ckey in clusters) {
    //console.log(util.inspect(c, false, null, true));
    let t = await PlanetDump.aggregate([
      {$match: {x: clusters[ckey].x}},
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
    await Cluster.updateOne({x: ckey.x}, {
      age: Number(typeof (clusters[ckey].age) != 'undefined' ? clusters[ckey].age + 1 : 1),
      size: t[0].size,
      score: t[0].score,
      value: t[0].value,
      xp: t[0].xp,
      ratio: t[0].value !== 0 ? 10000.0 * t[0].size / t[0].value : 0,
      members: t[0].members
    });
  }
  //TODO:ADD REMAINING FIELDS ABOVE
  //##########################


  console.log(`Updated clusters in: ${(new Date()) - start_time}ms`);
  //##############
  //Galaxies
  //##############
  let galaxies = await Galaxy.find();
  for (let gkey in galaxies) {
    await GalaxyDump.updateOne({
      x: galaxies[gkey].x,
      y: galaxies[gkey].y
    }, {
      galaxy_id: galaxies[gkey]._id
    });
  }

  await Galaxy.updateMany({}, {active: true});

  let galaxy_temp = await GalaxyDump.find({galaxy_id: undefined});
  for (let gkey in galaxy_temp) {
    //console.log(util.inspect(g, false, null, true));
    let gal = new Galaxy({
      x: galaxy_temp[gkey].x,
      y: galaxy_temp[gkey].y,
      active: true
    });
    let saved = await gal.save();
    await GalaxyDump.updateOne({
      x: galaxy_temp[gkey].x,
      y: galaxy_temp[gkey].y
    }, {galaxy_id: saved._id});
  }


  galaxy_temp = await GalaxyDump.find({galaxy_id: {$ne: undefined}}, 'galaxy_id');
  let gupdcount = await Galaxy.updateMany({_id: {$nin: galaxy_temp.map(g => g.galaxy_id)}}, {active: false});
  //console.log('Galaxies set inactive: ' + util.inspect(gupdcount, false, null, true));

  galaxies = await Galaxy.find({active: true});
  for (let gkey in galaxies) {
    //console.log(util.inspect(g, false, null, true));
    let gal = await GalaxyDump.aggregate([
      {
        $match: {
          x: galaxies[gkey].x,
          y: galaxies[gkey].y
        }
      },
      {
        $group: {
          _id: null,
          name: {$first: '$name'},
          size: {$sum: '$size'},
          score: {$sum: '$score'},
          value: {$sum: '$value'},
          xp: {$sum: '$xp'}
        }
      }
    ]);
    let t = await PlanetDump.aggregate([
      {
        $match: {
          x: {$eq: galaxies[gkey].x},
          y: {$eq: galaxies[gkey].y}
        }
      },
      {
        $group: {
          _id: null,
          members: {$sum: 1}
        }
      }
    ]);
    await Galaxy.updateOne({
      x: {$eq: galaxies[gkey].x},
      y: {$eq: galaxies[gkey].y}
    }, {
      age: Number(typeof (galaxies[gkey].age) != 'undefined' ? galaxies[gkey].age + 1 : 1),
      name: gal[0].name,
      size: gal[0].size,
      score: gal[0].score,
      value: gal[0].value,
      xp: gal[0].xp,
      ratio: gal[0].value !== 0 ? 10000.0 * gal[0].size / gal[0].value : 0,
      members: t[0].members
    });
  }

  console.log(`Updated galaxies in: ${(new Date()) - start_time}ms`);
  //##############
  //Planets
  //##############

  let planets = await Planet.find();
  for (let pkey in planets) {
    await PlanetDump.updateOne({id: planets[pkey].id}, {
      planet_id: planets[pkey].id
    });
  }


  //shuffle tick
  if (new_tick.id === config.pa.tick.shuffle) {

  }

  let planet_temp = await PlanetDump.find({planet_id: undefined});
  for (let pkey in planet_temp) {
    //console.log(util.inspect(p, false, null, true));
    let plnt = new Planet({
      id: planet_temp[pkey].id,
      x: planet_temp[pkey].x,
      y: planet_temp[pkey].y,
      z: planet_temp[pkey].z,
      active: true
    });
    let saved = await plnt.save();
    await PlanetDump.updateOne({id: planet_temp[pkey].id}, {planet_id: saved.id});
  }

  //track planets


  //set inactive
  planet_temp = await PlanetDump.find({planet_id: {$ne: undefined}}, 'planet_id');
  //console.log(util.inspect(planet_temp.map(p => p), false, null, true));
  //let pupdcount = await Planet.updateMany({id: {$nin: planet_temp.map(p => p.planet_id)}}, {active: false});
  //console.log('Planets set inactive: ' + util.inspect(pupdcount, false, null, true));

  planets = await Planet.find({active: true});
  for (let pkey in planets) {
    //console.log('Planet' + util.inspect(planets[pkey], false, null, true));
    let t = await PlanetDump.aggregate([
      {$match: {id: planets[pkey].id}},
      {
        $group: {
          _id: null,
          planetname: {$first: '$planetname'},
          rulername: {$first: '$rulername'},
          race: {$first: '$race'},
          size: {$sum: '$size'},
          score: {$sum: '$score'},
          value: {$sum: '$value'},
          xp: {$sum: '$xp'}
        }
      }
    ]);
    if (t != null && t.length >= 1) {
      await Planet.updateOne({id: planets[pkey].id}, {
        age: Number(typeof (planets[pkey].age) != 'undefined' ? planets[pkey].age + 1 : 1),
        planetname: t[0].planetname,
        rulername: t[0].rulername,
        race: t[0].race,
        size: t[0].size,
        score: t[0].score,
        value: t[0].value,
        xp: t[0].xp,
        ratio: t[0].value !== 0 ? 10000.0 * t[0].size / t[0].value : 0
      });
    }
  }


  //idle


  //value drops


  //landings


  //landed on


  console.log(`Updated planets in: ${(new Date()) - start_time}ms`);
  //##############
  //Alliances
  //##############
  let alliances = await Alliance.find();
  for (let akey in alliances) {
    await AllianceDump.updateOne({name: alliances[akey].name}, {
      alliance_id: alliances[akey]._id
    });
  }

  await Alliance.updateMany({}, {active: true});

  let alliance_temp = await AllianceDump.find({alliance_id: undefined});
  for (let akey in alliance_temp) {
    //console.log(util.inspect(alliance_temp[akey], false, null, true));
    let ally = new Alliance({
      name: alliance_temp[akey].name,
      active: true
    });
    let saved = await ally.save();
    await AllianceDump.updateOne({name: alliance_temp[akey].name}, {alliance_id: saved._id});
  }

  alliance_temp = await AllianceDump.find({alliance_id: {$ne: undefined}}, 'alliance_id');
  await Alliance.updateMany({alliance_id: {$nin: alliance_temp.map(a => a)}}, {active: false});

  alliances = await Alliance.find({active: true});
  for (let akey in alliances) {
    let ally = await AllianceDump.aggregate([
      {$match: {name: alliances[akey].name}},
      {
        $group: {
          _id: null,
          name: {$first: '$name'},
          members: {$sum: '$members'},
          size: {$sum: '$size'},
          score: {$sum: '$score'},
          points: {$sum: '$points'},
          size_avg: {$sum: '$size_avg'},
          score_avg: {$sum: '$score_avg'},
          points_avg: {$sum: '$points_avg'}
        }
      }
    ]);
    await Alliance.updateOne({name: alliances[akey].name}, {
      age: Number(typeof (alliances[akey].age) != 'undefined' ? alliances[akey].age + 1 : 1),
      name: ally[0].name,
      members: ally[0].members,
      size: ally[0].size,
      score: ally[0].score,
      points: ally[0].points,
      size_avg: ally[0].size_avg,
      score_avg: ally[0].score_avg,
      points_avg: ally[0].points_avg,
      ratio: ally[0].score !== 0 ? 10000.0 * ally[0].size / ally[0].score : 0
    });
  }


  console.log(`Updated alliances in: ${(new Date()) - start_time}ms`);
  //##############
  //History
  //##############
  let cluster_count = await Cluster.aggregate([
    {$match: {active: {$eq: true}}},
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let galaxy_count = await Galaxy.aggregate([
    {$match: {active: {$eq: true}}},
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let planet_count = await Planet.aggregate([
    {$match: {active: {$eq: true}}},
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let alliance_count = await Alliance.aggregate([
    {$match: {active: {$eq: true}}},
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let c200_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        x: {$eq: 200}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let ter_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        race: {$regex: /^ter$/i}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let cat_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        race: {$regex: /^cat$/i}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let xan_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        race: {$regex: /^xan$/i}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let zik_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        race: {$regex: /^zik$/i}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);
  let etd_count = await Planet.aggregate([
    {
      $match: {
        active: {$eq: true},
        race: {$regex: /^etd$/i}
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]);

  await Tick.updateOne({id: new_tick.id}, {
    clusters: typeof (cluster_count[0]) != 'undefined' ? cluster_count[0].count : 0,
    galaxies: typeof (galaxy_count[0]) != 'undefined' ? galaxy_count[0].count : 0,
    planets: typeof (planet_count[0]) != 'undefined' ? planet_count[0].count : 0,
    alliances: typeof (alliance_count[0]) != 'undefined' ? alliance_count[0].count : 0,
    c200: typeof (c200_count[0]) != 'undefined' ? c200_count[0].count : 0,
    ter: typeof (ter_count[0]) != 'undefined' ? ter_count[0].count : 0,
    cat: typeof (cat_count[0]) != 'undefined' ? cat_count[0].count : 0,
    xan: typeof (xan_count[0]) != 'undefined' ? xan_count[0].count : 0,
    zik: typeof (zik_count[0]) != 'undefined' ? zik_count[0].count : 0,
    etd: typeof (etd_count[0]) != 'undefined' ? etd_count[0].count : 0
  });


  //##############
  //Dicks
  //##############


  console.log(`Updated pt${new_tick.id} stats in: ${(new Date()) - start_time}ms\n`);


  //##############
  //Save Tick
  //##############
  let thistick = await new_tick.save();

  if (thistick != null) {
    console.log(`pt${thistick.id} saved to Ticks collection.`);

    //##############
    //Send Message
    //##############
    let txt = `pt<b>${thistick.id}</b> ${moment(thistick.timestamp).utc().format('H:mm')} <i>GMT</i>`;
    let atts = await Attack.find({releasetick: thistick.id});
    for (let m = 0; m < atts.length; m++) {
      txt += `\n<b>Attack ${atts[m].id}</b> released. <a href="${config.web.uri}/att/${atts[m].hash}">Claim Targets</a>`;
    }
    //console.log(util.inspect('TEXT: ' + txt, false, null, true));
    if (config.bot.tick_alert || atts.length > 0) {
      let msg = new BotMessage({
        id: crypto.randomBytes(8).toString("hex"),
        group_id: config.groups.private,
        message: txt,
        sent: false
      });
      let msgsaved = await msg.save();
      console.log(`Sent Message: "${msgsaved.message}"`);
    }
  }
}


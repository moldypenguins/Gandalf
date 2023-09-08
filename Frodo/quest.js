"use strict";
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
 * @name quest.js
 * @version 2023-01-19
 * @summary Ticker
 **/


import { parentPort, workerData } from "worker_threads";
import pRetry, {AbortError} from "p-retry";
import pTimeout from "p-timeout";
import Config from "sauron";
import {
    Mordor,
    BotMessage, Tick,
    Planet, PlanetDump, PlanetHistory, PlanetTrack,
    Galaxy, GalaxyDump, GalaxyHistory,
    Alliance, AllianceDump, AllianceHistory,
    Cluster, ClusterHistory,
    User, HeroPower
} from "mordor";
import axios from "axios";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import * as util from "util";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const controller = new AbortController();
const sleep = (ms) => { return new Promise(r => setTimeout(r, ms)); };

const log = (message) => {
    if(parentPort) { 
        parentPort.postMessage(message);
    }
    else {
        log(message);
    }
};

const retry = pRetry(async() => {
    let overwrite = workerData?.overwrite || false;
    let havoc = workerData?.havoc || false;
    let current_ms = 0;
    let total_ms = 0;
    const start_time = new Date();
    log("Frodo embarking on The Quest Of The Ring.");
    //log(`Job Time: ${dayjs(fire_time).format('YYYY-MM-DD H:mm:ss')}`);
    log(`Start Time: ${dayjs(start_time).format("YYYY-MM-DD H:mm:ss")}`);

    //get last tick
    let last_tick = await Tick.findLastTick();
    if (last_tick === null || typeof(last_tick.tick) === "undefined" || last_tick.tick === null) {
        controller.abort("No ticks found in the database.");
    } else {
        log("Last tick: " + last_tick.tick);
    }

    //get dump files
    log("Getting dump files...");
    let planet_dump, galaxy_dump, alliance_dump, user_dump;
    try {
        [planet_dump, galaxy_dump, alliance_dump, user_dump] = await Promise.all([
            axios.get(Config.pa.dumps.planet, { responseType: "text", headers: { "User-Agent": "Gandalf-1.0.0" }}),
            axios.get(Config.pa.dumps.galaxy, { responseType: "text", headers: { "User-Agent": "Gandalf-1.0.0" }}),
            axios.get(Config.pa.dumps.alliance, { responseType: "text", headers: { "User-Agent": "Gandalf-1.0.0" }}),
            axios.get(Config.pa.dumps.user, { responseType: "text", headers: { "User-Agent": "Gandalf-1.0.0" }})
        ]);
    } catch (err) {
        throw new Error(err);
    }

    if (
        planet_dump?.status === 200 && planet_dump.data &&
        galaxy_dump?.status === 200 && galaxy_dump.data &&
        alliance_dump?.status === 200 && alliance_dump.data &&
        user_dump?.status === 200 && user_dump.data
    ) {
        current_ms = (new Date()) - start_time;
        log(`Loaded dumps from webserver in: ${current_ms - total_ms}ms`);
        total_ms += current_ms - total_ms;

        planet_dump = planet_dump.data.split("\n");
        galaxy_dump = galaxy_dump.data.split("\n");
        alliance_dump = alliance_dump.data.split("\n");
        user_dump = user_dump.data.split("\n");

        if (planet_dump[3] !== galaxy_dump[3] || galaxy_dump[3] !== alliance_dump[3] || planet_dump[3] !== alliance_dump[3]) {
            throw new Error(`Varying ticks found - planet: ${planet_dump[3].match(/\d+/g).map(Number)[0]} - galaxy: ${galaxy_dump[3].match(/\d+/g).map(Number)[0]} - alliance: ${alliance_dump[3].match(/\d+/g).map(Number)[0]}.`);
        } else {
            let dump_tick = planet_dump[3].match(/\d+/g).map(Number)[0];

            if (!overwrite && dump_tick <= last_tick.tick) {
                throw new Error(`Stale tick found: pt${dump_tick}`);
            } else {
                //get or create tick object
                let new_tick;
                if (dump_tick <= last_tick.tick) {
                    new_tick = await Tick.findOne({tick: dump_tick});
                    //TODO: restore Clusters/Galaxies/Planets/Alliances from history tables
                    log(`Updating Tick: pt${new_tick.tick} - ${dayjs(new_tick.timestamp).tz().format("YYYY-MM-dd HH:mm z")}`);
                } else {
                    new_tick = await new Tick({
                        _id: new Mordor.Types.ObjectId(),
                        tick: dump_tick,
                        timestamp: dayjs().utc().minute(Math.floor(dayjs().minute() / (havoc ? 15 : 60)) * (havoc ? 15 : 60)).second(0).millisecond(0)
                    });
                    log(`Creating Tick: pt${new_tick.tick} - ${dayjs(new_tick.timestamp).tz().format("YYYY-MM-dd HH:mm z")}`);
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
                log(`Cleaned old dumps in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;

                //Planet Dumps
                if (planet_dump !== undefined && planet_dump != null) {
                    for (let i = 8; i <= planet_dump.length; i++) {
                        if (planet_dump[i] === "EndOfPlanetarionDumpFile") {
                            break;
                        } else {
                            let p = planet_dump[i].split("\t");
                            //log(util.inspect(p, false, null, true));
                            await new PlanetDump({
                                _id: new Mordor.Types.ObjectId(),
                                planet_id: p[0],
                                x: Number(p[1]),
                                y: Number(p[2]),
                                z: Number(p[3]),
                                planetname: p[4].replace(/"/g, ""),
                                rulername: p[5].replace(/"/g, ""),
                                race: p[6],
                                size: Number(p[7] ?? 0),
                                score: Number(p[8] ?? 0),
                                value: Number(p[9] ?? 0),
                                xp: Number(p[10] ?? 0),
                                special: p[11] ?? p[11].replace(/"/g, ""),
                            }).save();
                        }
                    }
                    planet_dump = undefined;
                }

                //Galaxy Dumps
                if (galaxy_dump !== undefined && galaxy_dump != null) {
                    for (let i = 8; i <= galaxy_dump.length; i++) {
                        if (galaxy_dump[i] === "EndOfPlanetarionDumpFile") {
                            break;
                        } else {
                            let g = galaxy_dump[i].split("\t");
                            //log(util.inspect(g, false, null, true));
                            await new GalaxyDump({
                                _id: new Mordor.Types.ObjectId(),
                                x: Number(g[0]),
                                y: Number(g[1]),
                                name: g[2].replace(/"/g, ""),
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
                if (alliance_dump !== undefined && alliance_dump != null) {
                    for (let i = 8; i <= alliance_dump.length; i++) {
                        if (alliance_dump[i] === "EndOfPlanetarionDumpFile") {
                            break;
                        } else {
                            let a = alliance_dump[i].split("\t");
                            //log(util.inspect(a, false, null, true));
                            await new AllianceDump({
                                _id: new Mordor.Types.ObjectId(),
                                rank: Number(a[0]),
                                name: a[1].replace(/"/g, ""),
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
                //log(util.inspect(u, false, null, true));
                await new UserDump({
                  _id: new Mordor.Types.ObjectId(),
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
                log(`Refreshed dumps in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;


                //##############################################################################################################
                //Planets
                //##############################################################################################################

                //set all planets to inactive
                await Planet.updateMany({}, { active: false });

                //loop through planets
                let dumpPlanets = await PlanetDump.find({});

                for(let p_temp in dumpPlanets) {
                    //create planet if not exists
                    if (!await Planet.exists({planet_id: dumpPlanets[p_temp].planet_id})) {
                        await new Planet({
                            _id: new Mordor.Types.ObjectId(),
                            planet_id: dumpPlanets[p_temp].planet_id,
                            x: dumpPlanets[p_temp].x,
                            y: dumpPlanets[p_temp].y,
                            z: dumpPlanets[p_temp].z,
                            planetname: dumpPlanets[p_temp].planetname,
                            rulername: dumpPlanets[p_temp].rulername,
                            race: dumpPlanets[p_temp].race
                        }).save();
                        //track new planet
                        await new PlanetTrack({
                            _id: new Mordor.Types.ObjectId(),
                            planet_id: dumpPlanets[p_temp].planet_id,
                            new_x: dumpPlanets[p_temp].x,
                            new_y: dumpPlanets[p_temp].y,
                            new_z: dumpPlanets[p_temp].z
                        }).save();
                    }
                    //get planet
                    let planet = await Planet.findOne({planet_id: dumpPlanets[p_temp].planet_id});

                    //track renamed planet
                    if (planet.rulername !== dumpPlanets[p_temp].rulername || planet.planetname !== dumpPlanets[p_temp].planetname) {
                        await new PlanetTrack({
                            _id: new Mordor.Types.ObjectId(),
                            planet_id: planet.planet_id,
                            old_x: planet.x,
                            old_y: planet.y,
                            old_z: planet.z,
                            new_x: dumpPlanets[p_temp].x,
                            new_y: dumpPlanets[p_temp].y,
                            new_z: dumpPlanets[p_temp].z
                        }).save();
                    }

                    //track exiled planet
                    if (planet.x !== dumpPlanets[p_temp].x || planet.y !== dumpPlanets[p_temp].y || planet.z !== dumpPlanets[p_temp].z) {
                        await new PlanetTrack({
                            _id: new Mordor.Types.ObjectId(),
                            planet_id: planet.planet_id,
                            old_x: planet.x,
                            old_y: planet.y,
                            old_z: planet.z,
                            new_x: dumpPlanets[p_temp].x,
                            new_y: dumpPlanets[p_temp].y,
                            new_z: dumpPlanets[p_temp].z
                        }).save();
                    }


                    //console.log(`HERE: ${util.inspect(planet.size, true, null, true)}`);

                    //update planet
                    await Planet.updateOne({planet_id: planet.planet_id}, {
                        x: dumpPlanets[p_temp].x,
                        y: dumpPlanets[p_temp].y,
                        z: dumpPlanets[p_temp].z,
                        planetname: dumpPlanets[p_temp].planetname,
                        rulername: dumpPlanets[p_temp].rulername,
                        race: dumpPlanets[p_temp].race,
                        size: dumpPlanets[p_temp].size,
                        score: dumpPlanets[p_temp].score,
                        value: dumpPlanets[p_temp].value,
                        xp: dumpPlanets[p_temp].xp,
                        active: true,
                        age: planet.age + 1 ?? 1,
                        ratio: dumpPlanets[p_temp].value !== 0 ? 10000.0 * dumpPlanets[p_temp].size / dumpPlanets[p_temp].value : 0,
                        size_growth: dumpPlanets[p_temp].size - (planet.size ?? 0),
                        score_growth: dumpPlanets[p_temp].score - (planet.score ?? 0),
                        value_growth: dumpPlanets[p_temp].value - (planet.value ?? 0),
                        xp_growth: dumpPlanets[p_temp].xp - (planet.xp ?? 0),
                        size_rank: await PlanetDump.find({size: {$gt: dumpPlanets[p_temp].size}, x: {$ne: 200}}).countDocuments() + 1,
                        score_rank: await PlanetDump.find({score: {$gt: dumpPlanets[p_temp].score}, x: {$ne: 200}}).countDocuments() + 1,
                        value_rank: await PlanetDump.find({value: {$gt: dumpPlanets[p_temp].value}, x: {$ne: 200}}).countDocuments() + 1,
                        xp_rank: await PlanetDump.find({xp: {$gt: dumpPlanets[p_temp].xp}, x: {$ne: 200}}).countDocuments() + 1,

                        //TODO: add remaining fields

                    });
                }

                //track deleted planets
                let deletedPlanets = await Planet.find({active: false});
                for (let dp in deletedPlanets) {
                    await new PlanetTrack({
                        _id: new Mordor.Types.ObjectId(),
                        planet_id: deletedPlanets[dp].planet_id,
                        old_x: deletedPlanets[dp].x,
                        old_y: deletedPlanets[dp].y,
                        old_z: deletedPlanets[dp].z
                    }).save();
                    await Planet.deleteOne({planet_id: deletedPlanets[dp].planet_id});
                }


                //idle


                //value drops


                //landings


                //landed on


                current_ms = (new Date()) - start_time;
                log(`Updated planets in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;


                //##############################################################################################################
                //Galaxies
                //##############################################################################################################

                //set all galaxies to inactive
                await Galaxy.updateMany({}, { active: false });

                //loop through galaxies
                let dumpGalaxies = await GalaxyDump.find({});

                for (let g_temp in dumpGalaxies) {
                    //create galaxy if not exists
                    if (!await Galaxy.exists({x: dumpGalaxies[g_temp].x, y: dumpGalaxies[g_temp].y})) {
                        await new Galaxy({
                            _id: new Mordor.Types.ObjectId(),
                            x: dumpGalaxies[g_temp].x,
                            y: dumpGalaxies[g_temp].y,
                            name: dumpGalaxies[g_temp].name
                        }).save();
                    }
                    //get galaxy
                    let galaxy = await Galaxy.findOne({x: dumpGalaxies[g_temp].x, y: dumpGalaxies[g_temp].y});
                    //aggregate planets
                    let p = await PlanetDump.aggregate([
                        {$match: {x: galaxy.x, y: galaxy.y}},
                        {
                            $group: {
                                _id: null,
                                planets: {$sum: 1}
                            }
                        }
                    ]);
                    //update galaxy
                    await Galaxy.updateOne({x: galaxy.x, y: galaxy.y}, {
                        name: dumpGalaxies[g_temp].name,
                        size: dumpGalaxies[g_temp].size,
                        score: dumpGalaxies[g_temp].score,
                        value: dumpGalaxies[g_temp].value,
                        xp: dumpGalaxies[g_temp].xp,
                        active: true,
                        age: galaxy.age + 1 ?? 1,
                        planets: p[0].planets,
                        ratio: dumpGalaxies[g_temp].value !== 0 ? 10000.0 * dumpGalaxies[g_temp].size / dumpGalaxies[g_temp].value : 0,

                        size_growth: dumpGalaxies[g_temp].size - (galaxy.size ?? 0),
                        score_growth: dumpGalaxies[g_temp].score - (galaxy.score ?? 0),
                        value_growth: dumpGalaxies[g_temp].value - (galaxy.value ?? 0),
                        xp_growth: dumpGalaxies[g_temp].xp - (galaxy.xp ?? 0),
                        planet_growth: p[0].planets - (galaxy.planets ?? 0),
                        size_rank: await GalaxyDump.find({size: {$gt: dumpGalaxies[g_temp].size}, x: {$ne: 200}}).countDocuments() + 1,
                        score_rank: await GalaxyDump.find({score: {$gt: dumpGalaxies[g_temp].score}, x: {$ne: 200}}).countDocuments() + 1,
                        value_rank: await GalaxyDump.find({value: {$gt: dumpGalaxies[g_temp].value}, x: {$ne: 200}}).countDocuments() + 1,
                        xp_rank: await GalaxyDump.find({xp: {$gt: dumpGalaxies[g_temp].xp}, x: {$ne: 200}}).countDocuments() + 1,

                        //TODO: add remaining fields

                    });
                }

                current_ms = (new Date()) - start_time;
                log(`Updated galaxies in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;



                //##############################################################################################################
                //Clusters
                //##############################################################################################################

                //set all clusters to inactive
                await Cluster.updateMany({}, { active: false });

                //loop through distinct x in galaxies
                let dumpClusters = await GalaxyDump.find({}, {x: 1}).distinct("x");
                //log(`CLUSTERS: ` + util.inspect(clusters, true, null, true));

                //loop through x in galaxies to update clusters
                for(let c_temp in dumpClusters) {
                    //create cluster if not exists
                    if(!await Cluster.exists({x: dumpClusters[c_temp]})) {
                        await new Cluster({_id: new Mordor.Types.ObjectId(), x: dumpClusters[c_temp]}).save();
                    }
                    //get cluster
                    let cluster = await Cluster.findOne({x: dumpClusters[c_temp]});
                    //aggregate galaxies
                    let g = await GalaxyDump.aggregate([
                        {$match: {x: cluster.x}},
                        {
                            $group: {
                                _id: null,
                                size: {$sum: "$size"},
                                score: {$sum: "$score"},
                                value: {$sum: "$value"},
                                xp: {$sum: "$xp"},
                                galaxies: {$sum: 1},
                            }
                        }
                    ]);
                    //aggregate planets
                    let p = await PlanetDump.aggregate([
                        {$match: {x: cluster.x}},
                        {
                            $group: {
                                _id: null,
                                planets: {$sum: 1}
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
                        galaxies: g[0].galaxies,
                        planets: p[0].planets,
                        ratio: g[0].value !== 0 ? 10000.0 * g[0].size / g[0].value : 0,
                        size_growth: g[0].size - (cluster.size ?? 0),
                        score_growth: g[0].score - (cluster.score ?? 0),
                        value_growth: g[0].value - (cluster.value ?? 0),
                        xp_growth: g[0].xp - (cluster.xp ?? 0),
                        galaxy_growth: g[0].galaxies - (cluster.galaxies ?? 0),
                        planet_growth: p[0].planets - (cluster.planets ?? 0),

                        //TODO: add remaining fields

                    });
                }

                //delete inactive clusters
                await Cluster.deleteMany({active: false});

                //loop through clusters to update ranks
                let rankClusters = await Cluster.find({active: true});
                for(let c in rankClusters) {
                    await Cluster.updateOne({x: rankClusters[c].x}, {
                        size_rank: await Cluster.find({size: {$gt: rankClusters[c].size}, x: {$ne: 200}}).countDocuments() + 1,
                        score_rank: await Cluster.find({score: {$gt: rankClusters[c].score}, x: {$ne: 200}}).countDocuments() + 1,
                        value_rank: await Cluster.find({value: {$gt: rankClusters[c].value}, x: {$ne: 200}}).countDocuments() + 1,
                        xp_rank: await Cluster.find({xp: {$gt: rankClusters[c].xp}, x: {$ne: 200}}).countDocuments() + 1,
                    });
                }

                current_ms = (new Date()) - start_time;
                log(`Updated clusters in: ${current_ms - total_ms}ms`);
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
                        await new Alliance({_id: new Mordor.Types.ObjectId(), name: alliances[a_temp].name.trim()}).save();
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
                        ratio: 0, //alliances[a_temp].score !== 0 ? 10000.0 * alliances[a_temp].size / alliances[a_temp].score : 0,

                        //TODO: add remaining fields

                    });
                }

                current_ms = (new Date()) - start_time;
                log(`Updated alliances in: ${current_ms - total_ms}ms`);
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
                let kin_count = await Planet.aggregate([
                    {$match: {active: {$eq: true}, race: {$regex: /^kin$/i}}},
                    {$group: {_id: null, count: {$sum: 1}}}
                ]);
                let sly_count = await Planet.aggregate([
                    {$match: {active: {$eq: true}, race: {$regex: /^sly$/i}}},
                    {$group: {_id: null, count: {$sum: 1}}}
                ]);

                new_tick.clusters = typeof (cluster_count[0]) != "undefined" ? cluster_count[0].count : 0;
                new_tick.galaxies = typeof (galaxy_count[0]) != "undefined" ? galaxy_count[0].count : 0;
                new_tick.planets = typeof (planet_count[0]) != "undefined" ? planet_count[0].count : 0;
                new_tick.alliances = typeof (alliance_count[0]) != "undefined" ? alliance_count[0].count : 0;
                new_tick.c200 = typeof (c200_count[0]) != "undefined" ? c200_count[0].count : 0;
                new_tick.ter = typeof (ter_count[0]) != "undefined" ? ter_count[0].count : 0;
                new_tick.cat = typeof (cat_count[0]) != "undefined" ? cat_count[0].count : 0;
                new_tick.xan = typeof (xan_count[0]) != "undefined" ? xan_count[0].count : 0;
                new_tick.zik = typeof (zik_count[0]) != "undefined" ? zik_count[0].count : 0;
                new_tick.kin = typeof (kin_count[0]) != "undefined" ? kin_count[0].count : 0;
                new_tick.sly = typeof (sly_count[0]) != "undefined" ? sly_count[0].count : 0;

                let this_tick = await new_tick.save();
                log(`pt${this_tick.tick} saved to Ticks collection.`);

                current_ms = (new Date()) - start_time;
                log(`Updated tick stats in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;


                //##############################################################################################################
                //History
                //##############################################################################################################

                //TODO: verify this works

                let historyPlanets = await Planet.find({active: true});
                for (let p in historyPlanets) {
                    await new PlanetHistory({
                        _id: new Mordor.Types.ObjectId(),
                        tick: this_tick,
                        planet_id: historyPlanets[p].planet_id,
                        x: historyPlanets[p].x,
                        y: historyPlanets[p].y,
                        z: historyPlanets[p].z,
                        planetname: historyPlanets[p].planetname,
                        rulername: historyPlanets[p].rulername,
                        race: historyPlanets[p].race,
                        size: historyPlanets[p].size,
                        score: historyPlanets[p].score,
                        value: historyPlanets[p].value,
                        xp: historyPlanets[p].xp,
                        active: historyPlanets[p].active,
                        age: historyPlanets[p].age,
                        ratio: historyPlanets[p].ratio,
                        size_growth: historyPlanets[p].size,
                        score_growth: historyPlanets[p].score,
                        value_growth: historyPlanets[p].value,
                        xp_growth: historyPlanets[p].xp,
                        size_rank: historyPlanets[p].size_rank,
                        score_rank: historyPlanets[p].score_rank,
                        value_rank: historyPlanets[p].value_rank,
                        xp_rank: historyPlanets[p].xp_rank,
                    }).save();
                }
                let historyGalaxies = await Galaxy.find({active: true});
                for (let g in historyGalaxies) {
                    await new GalaxyHistory({
                        _id: new Mordor.Types.ObjectId(),
                        tick: this_tick,
                        x: historyGalaxies[g].x,
                        y: historyGalaxies[g].y,
                        name: historyGalaxies[g].name,
                        size: historyGalaxies[g].size,
                        score: historyGalaxies[g].score,
                        value: historyGalaxies[g].value,
                        xp: historyGalaxies[g].xp,
                        active: historyGalaxies[g].active,
                        age: historyGalaxies[g].age,
                        planets: historyGalaxies[g].planets,
                        ratio: historyGalaxies[g].ratio,
                        size_growth: historyGalaxies[g].size,
                        score_growth: historyGalaxies[g].score,
                        value_growth: historyGalaxies[g].value,
                        xp_growth: historyGalaxies[g].xp,
                        size_rank: historyGalaxies[g].size_rank,
                        score_rank: historyGalaxies[g].score_rank,
                        value_rank: historyGalaxies[g].value_rank,
                        xp_rank: historyGalaxies[g].xp_rank,
                    }).save();
                }
                let historyClusters = await Cluster.find({active: true});
                for (let c in historyClusters) {
                    await new ClusterHistory({
                        _id: new Mordor.Types.ObjectId(),
                        tick: this_tick,
                        x: historyClusters[c].x,
                        size: historyClusters[c].size,
                        score: historyClusters[c].score,
                        value: historyClusters[c].value,
                        xp: historyClusters[c].xp,
                        active: historyClusters[c].active,
                        age: historyClusters[c].age,
                        galaxies: historyClusters[c].galaxies,
                        planets: historyClusters[c].planets,
                        ratio: historyClusters[c].ratio,
                    }).save();
                }
                let historyAlliances = await Alliance.find({active: true});
                for (let a in historyAlliances) {
                    await new AllianceHistory({
                        _id: new Mordor.Types.ObjectId(),
                        tick: this_tick,
                        name: historyAlliances[a].name,
                        size: historyAlliances[a].size,
                        score: historyAlliances[a].score,
                        points: historyAlliances[a].points,
                        active: historyAlliances[a].active,
                        age: historyAlliances[a].age,
                        alias: historyAlliances[a].alias,
                        members: historyAlliances[a].members,
                        ratio: historyAlliances[a].ratio,
                    }).save();
                }

                current_ms = (new Date()) - start_time;
                log(`Updated history in: ${current_ms - total_ms}ms`);
                total_ms += current_ms - total_ms;



                //##############################################################################################################
                //Hero Power
                //##############################################################################################################
                if(false) {
                    //if(!await Alliance.exists({name: Config.alliance.name})) {
                    log("Your alliance does not exist in the database.");
                }
                else {
                    let hPowers = [];
                    let users = await User.find({});
                    //TODO: add filter users by coords in alliance
                    //let members = await Alliance.find({name: Config.alliance.name})
                    for(let mem in users) {
                        if(users[mem].planet?.planet_id) {

                            //console.log(`PID: ${util.inspect(users[mem].planet.planet_id, true, null, true)}`);

                            //aggregate planet history
                            let hGrowth = await PlanetHistory.aggregate([
                                {$match: {planet_id: users[mem].planet.planet_id}},
                                {$sort: {tick: -1}},
                                {$limit: 72},
                                {
                                    $group: {
                                        _id: null,
                                        score_growth: {$sum: "$score_growth"},
                                    }
                                }
                            ]);

                            //console.log(`HGROWTH: ${util.inspect(hGrowth[0], true, null, true)}`);

                            hPowers.push({
                                member: users[mem],
                                size: hGrowth[0].score_growth
                            });
                        }
                    }
                    hPowers = hPowers.sort((a, b) => { return b.size - a.size; });
                    for(let d = 0; d < hPowers.length; d++) {
                        let heroPower = new HeroPower({
                            _id: new Mordor.Types.ObjectId(),
                            tick: this_tick,
                            member: hPowers[d].member,
                            size: hPowers[d].size,
                            rank: d + 1,
                            members: hPowers.length
                        });
                        await heroPower.save();
                    }

                    current_ms = (new Date()) - start_time;
                    log(`Updated hero power in: ${current_ms - total_ms}ms`);
                    total_ms += current_ms - total_ms;
                }

                //##############################################################################################################
                //Send Message
                //##############################################################################################################



                if(Config.bot.tick_alert) {
                    console.log(`BOT: ${util.inspect(Config.bot,true,null,true)}`);
                    await new BotMessage({
                        _id: new Mordor.Types.ObjectId(),
                        tick: this_tick,
                        title: `pt${this_tick.tick}`,
                        description: `${dayjs(this_tick.timestamp).utc().format("H:mm")} GMT`
                    }).save();
                }
          

                current_ms = (new Date()) - start_time;
                log(`Total time: ${current_ms}ms!`);
            }
        }
    }
}, {
    forever: true,
    signal: controller.signal,
    minTimeout: 15000,
    maxTimeout: 15000,
    onFailedAttempt: async(error) => {
        log(error);
    }
});



(async () => {
    Mordor.connection.once("open", async() => {
        try {
            await pTimeout(retry,{
                signal: controller.signal,
                milliseconds: 60000 * 55,
                message: "Reached timeout without a successful dump, giving up!"
            });
        }
        catch(error) {
            log(error.message);
        }
        finally {
            process.exit(0);
        }
    });
})();
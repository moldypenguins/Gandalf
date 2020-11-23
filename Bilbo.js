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
 * @version 2020/11/19
 * @summary Initialization
 **/
const config = require('./config');
const db = require('./db');
const bent = require('bent');
const getStream = bent('string');
const parseString = require('xml2js').parseString;
const Ship = require('./models/ship.js');
const Member = require('./models/member.js');
const Tick = require('./models/tick.js');


db.connection.once("open", async () => {
    let ship_stats = await getStream(config.pa.dumps.ship_stats);
    parseString(ship_stats, (err, result) => {
        callback(null, result);
    });
    process.exitCode = 0;
});


let callback = (err, docs) => {
  let ship_id = 0;
  if (err){
    console.error(err);
    return;
  }
  Object.keys(docs).forEach(doc => {
    //console.log(docs[key]);
    Object.keys(docs[doc]).forEach(col => {
      docs[doc][col].forEach(sh => {
        Object.entries(sh).forEach(([key, val]) => {
          //console.log(`${key}: ${val[0]}`);
          sh[key] = val[0];
        });
        //console.log(sh);
        let ship = new Ship(sh);
        ship.id = ship_id++;
        //console.log(ship);

        ship.save(function (err, saved) {
          if (err){
            console.error(err);
            return;
          }
          console.log(saved.name + " saved to Ships collection.");
        });

      });
    });
  });

  Member.find({id: config.admin.id}).then((admin) => {
    console.log(admin);
    if (!admin || admin.length == 0) {
      let adm = new Member({ id: config.admin.id, access: 5, active: true });
      adm.save(function (err, saved) {
        if (err) return console.error(err);
        console.log(saved.username + " saved to Members collection.");
      });
    } else {
      console.log(config.admin.username + " already exists");
    }
  });
  // setup ticks if empty
  Tick.find().then((ticks) => {
    console.log(ticks);
    if (!ticks || ticks.length == 0) {
      Tick.insertMany([{id:0}]);
      console.log("adding first tick");
    } else {
      console.log("ticks already exist")
    }
  });
}



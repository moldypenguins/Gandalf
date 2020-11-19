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
 **/
var config = require('./config');
var https = require('https');
var parseString = require('xml2js').parseString;
var db = require('./db');
var Ship = require('./models/ship.js');
var Member = require('./models/member.js');
var Tick = require('./models/tick.js');


var req = https.get(config.pa.dumps.ship_stats, function(res) {
  var xml = '';
  res.on('data', function(chunk) {
    xml += chunk;
  });
  res.on('error', function(e) {
    callback(e, null);
  });
  res.on('timeout', function(e) {
    callback(e, null);
  });
  res.on('end', function() {
    parseString(xml, function(err, result) {
      callback(null, result);
    });
  });
});

function callback(err, docs) {
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



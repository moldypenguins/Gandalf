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
const config = require('../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require('util');
const Ship = require('../models/ship');
const Tick = require('../models/tick');


//let Ships_eff_usage = he.encode('!eff <number> <ship> [t1|t2|t3]');
let Ships_eff_usage = he.encode('!eff <number> <ship>');
let Ships_eff_desc = 'Calculates the efficiency of the specified number of ships.';
let Ships_eff = (args) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Ships_eff_usage); }
    let _number = args[0];
    let _ship = args[1];
    //let _target = args[2] ? args[2] : 't1';
    //console.log(`ARGS: number=${_number}, ship=${_ship}, target=${_target}`);
    //console.log(`ARGS: number=${_number}, ship=${_ship}`);

    let number = numeral(_number).value();
    if(number == null) { reject(`${_number} is not a valid number`); }
    //if(!Object.keys(config.pa.ships.targets).includes(_target.toLowerCase())) { reject(`${_target} is not a valid target`); }
    //let target = config.pa.ships.targets[_target.toLowerCase()];

    let ship = await Ship.findOne({$where:`this.name.toLowerCase().startsWith("${_ship.toLowerCase()}")`});
    //console.log("SHIP: " + util.inspect(ship, false, null, true));
    //let ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
    if(!ship) {
      reject(`Cannot find ship ${_ship}`);
    } else {
      let damage = ship.damage !== '-' ? numeral(ship.damage).value() * number : 0
      let message = `<b>${numeral(number).format('0,0')} ${ship.name} (${numeral(number * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / config.pa.numbers.ship_value).format('0a') })</b>`;

      switch (ship.type.toLowerCase()) {
        case 'pod':
          message += ` will capture ${numeral(damage / 50).format('0,0')} roids`;
          break;
        case 'structure':
          message += ` will destroy ${numeral(damage / 50).format('0,0')} structures`;
          break;
        default:
          message += ` will ${config.pa.ships.damagetypes[ship.type.toLowerCase()]}:\n`;
          for(let t in config.pa.ships.targets) {
            let target = config.pa.ships.targets[t];
            //console.log("TARGET: " + util.inspect(target, false, null, true));
            if (ship[target] !== '-') {
              message += `<i>${t}: ${ship[target]}s (${config.pa.ships.targeteffs[target] * 100}%)</i>\n`;
              let shiptargets = await Ship.find({class: ship[target]});
              //console.log("TARGETED SHIPS: " + util.inspect(shiptargets, false, null, true));
              if (shiptargets) {
                var results = shiptargets.map(function (shiptarget) {
                  switch (ship.type.toLowerCase()) {
                    case 'emp':
                      let empnumber = Math.trunc(config.pa.ships.targeteffs[target] * ship.guns * number * (100 - shiptarget.empres) / 100);
                      return (`${numeral(empnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a')})`);
                      break;
                    default:
                      let targetnumber = Math.trunc(config.pa.ships.targeteffs[target] * damage / shiptarget.armor);
                      return (`${numeral(targetnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a')})`);
                      break;
                  }
                });
                message += results.join('; ') + `\n`;
              }
            }
          }
          break;
      }
      resolve(message);
    }
  });
};

var Ships_stop_usage = he.encode('!stop <number> <ship>');
var Ships_stop_desc = 'Calculates the required defence to the specified number of ships.';
var Ships_stop = (args) => {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(args) || args.length < 2) { reject(Ships_stop_usage); }
    var _number = args[0];
    var _ship = args[1];

    var number = numeral(_number).value();
    if(number == null) { reject(`${_number} is not a valid number`); }

    Ship.find().then((ships) => {
      var ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
      if (!ship) {
        reject(`Cannot find ship ${_ship}`);
      }

      // TODO: stop structure killers / roiders
      var ships_who_target_class = ships.filter(s => s.target1 == ship.class || s.target2 == ship.class || s.target3 == ship.class);
      var message = `To stop <b>${numeral(number).format('0a')} ${ship.name}</b> (${numeral(number * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / config.pa.numbers.ship_value).format('0a') }) you'll need:\n`;
      if(ships_who_target_class) {
        var results = ships_who_target_class.map(function(shiptarget) {
          let target = shiptarget.target1 == ship.class ? "target1" : shiptarget.target2 == ship.class ? "target2" : "target3";
          let efficiency = config.pa.ships.targeteffs[target];
          switch(shiptarget.type.toLowerCase()) {
            case 'emp':
	            let empnumber = Math.trunc((Math.ceil(number/((100-(+ship.empres))/100)/(+shiptarget.guns)))/efficiency);
              return (`${numeral(empnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a') })`);
            default:
              let targetnumber = Math.trunc((ship.armor * number) / shiptarget.damage / efficiency);
              if (shiptarget.initiative > ship.initiative) {
                targetnumber += Math.trunc(efficiency * shiptarget.damage / ship.armor);
              }
              return (`${numeral(targetnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a') })`);
          }
        });
      }
      message += results.join("; ");
      resolve(message);
    });
  });
};

var Ships_cost_usage = he.encode('!cost <number> <ship>');
var Ships_cost_desc = 'Calculates the cost of producing the specified number of ships.';
var Ships_cost = (args) => {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(args) || args.length < 2) { reject(Ships_cost_usage); }
    var _number = args[0];
    var _ship = args[1];
    //console.log(`ARGS: number=${_number}, ship=${_ship}`);

    var number = numeral(_number).value();
    if(number == null) { reject(`${_number} is not a valid number`); }

    Ship.find().then((ships) => {
        //console.log(ships);
        var ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
      if(!ship) {
        reject(`Cannot find ship ${_ship}`);
      } else { 
        let reply = `Buying <b>${numeral(number).format('0a')} ${ship.name}</b> will cost ${numeral(number * Number(ship.metal)).format('0,0')} metal, ${numeral(number * Number(ship.crystal)).format('0,0')} crystal and ${numeral(number * Number(ship.eonium)).format('0,0')} eonium.`;
	resolve(reply);
      }
    }).catch((err) => { reject(err); });
  });
};

var Ships_afford_usage = he.encode('!afford <x:y:z> <ship>');
var Ships_afford_desc = 'Calculates the number of a certain ship the planet can produce based on the most recent planet scan.';
var Ships_afford = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};

var Ships_ship_usage = he.encode('!ship <ship>');
var Ships_ship_desc = 'Returns the stats of the specified ship.';
var Ships_ship = (args) => {
  return new Promise(function(resolve, reject) {
            if (!Array.isArray(args) || args.length < 1) { reject(Ships_ship_usage); }
            var _ship = args[0];
            //console.log(`ARGS: ship=${_ship}`);

    Ship.find().then((ships) => {
        //console.log(ships);
        var ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
              if(!ship) {
                reject(`Cannot find ship ${_ship}`);
              } else {
                let reply = `${ship.name} (${ship.race}) is class ${ship.class} | Target 1: ${ship.target1}`;
                if(ship.target2 != '-') {
                  reply += ` | Target 2: ${ship.target2}`;
                }
                if(ship.target3 != '-') {
                  reply += ` | Target 3: ${ship.target3}`;
                }
                reply += ` | Type: ${ship.type} | Init: ${ship.initiative}`;
               reply += ` | EMPres: ${ship.empres}`;
                
              if(ship.type.toLowerCase() == 'emp') {
                  reply += ` | Guns: ${ship.guns}`;
              } else { 
                  reply += ` | D/C: ${Math.trunc(Number(ship.damage)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
              } 
                 reply += ` | A/C: ${Math.trunc(Number(ship.armor)*10000/(Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)))}`;
                resolve(reply);
              }
            }).catch((err) => { reject(err); });
  });
};

/*
eta 10 landing pt 1800 (currently 1553) must launch at pt 1790 (05-24 20:55), or with prelaunch tick 1791 (currently +237)
*/
var Ships_launch_usage = he.encode('!launch <class|eta> <LT>');
var Ships_launch_desc = 'When ships should be launch to land at LT.';
var Ships_launch = (args) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(args) || args.length < 2) { reject(Ships_launch_usage); }
    var class_or_eta = args[0];
    var _lt = args[1];
    var eta = numeral(class_or_eta).value();
    Ship.find().then((ships) => {
      if(eta == null) {
        // check to see if it's a class (bs, fr, cr, fi, co, de)
        switch(class_or_eta) {
          case 'bs':
            eta = 10; break;
          case 'cr':
            eta = 10; break;
          case 'fr':
            eta = 9; break;
          case 'de':
            eta = 9; break;
          case 'fi':
            eta = 8; break;
          case 'co':
            eta = 8; break;
          default:
            reject(`Class or eta not provided.`);         
        }      
      }

      let lt = numeral(_lt).value();
      if (lt == null) reject(`LT must be a valid number.`);
      Tick.findOne().sort({id: -1}).then((tick) => {
        if (tick == null) reject(`Somethings wrong with getting ticks.`);
        let current_time = moment.utc();
        let launch_tick = lt - eta;
        let launch_time = current_time.add(launch_tick - tick.id, 'hours');
        let prelaunch_tick = lt - eta + 1;
        let prelaunch_mod = launch_tick - tick.id;
        let reply = `eta ${eta} landing pt ${lt} (currently ${tick.id}) must launch at pt ${launch_tick} (${launch_time.format('MM-dd H:55')}), or with prelaunch tick ${prelaunch_tick} (currently +${prelaunch_mod})`;        
	resolve(reply)
      })
    });
  });
};



module.exports = {
  "eff": { usage: Ships_eff_usage, description: Ships_eff_desc, cast: Ships_eff },
  "stop": { usage: Ships_stop_usage, description: Ships_stop_desc, cast: Ships_stop },
  "cost": { usage: Ships_cost_usage, description: Ships_cost_desc, cast: Ships_cost },
  "afford": { usage: Ships_afford_usage, description: Ships_afford_desc, cast: Ships_afford },
  "ship": { usage: Ships_ship_usage, description: Ships_ship_desc, cast: Ships_ship },
  "launch": { usage: Ships_launch_usage, description: Ships_launch_desc, cast: Ships_launch },
};



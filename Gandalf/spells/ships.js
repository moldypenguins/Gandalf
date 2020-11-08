const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const Ship = require('../../models/ship');
const Tick = require('../../models/tick');


var Ships_eff_usage = entities.encode('!eff <number> <ship> [t1|t2|t3]');
var Ships_eff_desc = 'Calculates the efficiency of the specified number of ships.';
var Ships_eff = (args) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(args) || args.length < 2) { reject(Ships_eff_usage); }
    var _number = args[0];
    var _ship = args[1];
    var _target = args[2] ? args[2] : 't1';
    //console.log(`ARGS: number=${_number}, ship=${_ship}, target=${_target}`);

    var number = numeral(_number).value();
    if(number == null) { reject(`${_number} is not a valid number`); }
    if(!Object.keys(config.pa.ships.targets).includes(_target.toLowerCase())) { reject(`${_target} is not a valid target`); }
    var target = config.pa.ships.targets[_target.toLowerCase()];
    
    Ship.find().then((ships) => {
        //console.log(ships);
        var ship = ships.find(s => s.name.toLowerCase().startsWith(_ship.toLowerCase()) );
        if(!ship) {
          reject(`Cannot find ship ${_ship}`);
        } else {
          var damage = ship.damage != '-' ? numeral(ship.damage).value() * number : 0
          var message = `<b>${numeral(number).format('0a')} ${ship.name} (${numeral(number * (Number(ship.metal) + Number(ship.crystal) + Number(ship.eonium)) / config.pa.numbers.ship_value).format('0a') })</b>`;
          if(ship[target] == '-') {
            reject(`${ship.name} does not have a ${target}`);
          } else {
            switch(ship.type.toLowerCase()) {
              case 'pod':
                message += ` will capture ${numeral(damage / 50).format('0,0')} roids`;
                break;
              case 'structure':
                message += ` will destroy ${numeral(damage / 50).format('0,0')} structures`;
                break;
              default:
                message += ` hitting <i>${ship[target].toLowerCase()}</i> will ${config.pa.ships.damagetypes[ship.type.toLowerCase()]}:\n`;
                var shiptargets = ships.filter(s => s.class == ship[target]);
                if(shiptargets) {
                  var results = shiptargets.map(function(shiptarget) {
                    switch(ship.type.toLowerCase()) {
                      case 'emp':
                        let empnumber = Math.trunc(config.pa.ships.targeteffs[target] * ship.guns * number * (100 - shiptarget.empres) / 100);
                        return (`${numeral(empnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(empnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a') })`);
                        break;
                      default:
                        let targetnumber = Math.trunc(config.pa.ships.targeteffs[target] * damage / shiptarget.armor);
                        return (`${numeral(targetnumber).format('0,0')} <b>${shiptarget.name}</b> (${numeral(targetnumber * (Number(shiptarget.metal) + Number(shiptarget.crystal) + Number(shiptarget.eonium)) / config.pa.numbers.ship_value).format('0a') })`);
                        break;
                    }
                  });
                  message += results.join('; ');
                }
                break;
            }
          }
          resolve(message);
        }
      
    }).catch((err) => { reject(err); });
  });
};

var Ships_stop_usage = entities.encode('!stop <number> <ship>');
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

var Ships_cost_usage = entities.encode('!cost <number> <ship>');
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

var Ships_afford_usage = entities.encode('!afford <x:y:z> <ship>');
var Ships_afford_desc = 'Calculates the number of a certain ship the planet can produce based on the most recent planet scan.';
var Ships_afford = (args) => {
  return new Promise(function(resolve, reject) {
    resolve('Coming Soon');
  });
};

var Ships_ship_usage = entities.encode('!ship <ship>');
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
var Ships_launch_usage = entities.encode('!launch <class|eta> <LT>');
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



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



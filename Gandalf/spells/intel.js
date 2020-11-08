const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const Utils = require('../../utils');
const Intel = require('../../models/intel');
const Planet = require('../../models/planet');
const Alliance = require('../../models/alliance');

var Intel_usage = entities.encode('!intel <coords> <alliance=alliance> <nick=nick>');
var Intel_desc = 'Displays or sets a coords';
var Intel_fn = (args) => {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(args) || args.length < 1) { reject(Intel_usage); }
        var coords = Utils.parseCoords(args[0]);
        if (coords == null) {
            reject(`Cannot parse provided coords: ${args[0]}`)
        }

        if (args.length == 1 && coords.x && coords.y && coords.z) {
            var planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z });
            if (!planet) {
                reject(`(1) No planet found for ${coords.x}:${coords.y}:${coords.z}`);
                return;
            }
            var intel = await Intel.findOne({ planet_id: planet.id });
            var reply = "";
            if (!intel) {
                reply = `No intel stored for ${coords.x}:${coords.y}:${coords.z}`;
            } else {
                reply = `Intel for ${coords.x}:${coords.y}:${coords.z}\n` + await output(intel)
            }
            resolve(reply);
            return;
        } else if (args.length == 1 && coords.x && coords.y && !coords.z) {
            var reply = `Intel for ${coords.x}:${coords.y}:\n`;
            for (var i = 1; i < 12; i++) {
                var planet = await Planet.findOne({ x: coords.x, y: coords.y, z: i });
                if (planet) {
                    var intel = await Intel.findOne({ planet_id: planet.id });
                    if (intel) {
                        var alliance_text = ``;
                        if (intel.alliance_id) {
                            var alliance = await Alliance.findOne({id: intel.alliance_id});
                            if (alliance) alliance_text = `<b>${alliance.name}</b>`;
                        }
                        reply += `${i}: <b>${intel.nick}</b> ${alliance_text}\n`
                    }
                }
            }
            
            resolve(reply);
            return;
        }

        var planet = await Planet.findOne({ x: coords.x, y: coords.y, z: coords.z });
        if (!planet) {
            reject(`(2) No planet found for ${coords.x}:${coords.y}:${coords.z}`);
            return;
        }
        var intel = await Intel.findOne({ planet_id: planet.id });
        if (!intel) {
            intel = new Intel({ planet_id: planet.id });
        }
        for (var item of args.slice(1)) {
            var split = item.split("=");
            if (split.length != 2) {
                reject(Intel_usage);
                return;
            }
            var key = split[0];
            var value = split[1];
            switch (key.toLowerCase()) {
                case 'nick':
                    intel.nick = value;
                    break;
                case 'alliance': {
                    var alliances = await Alliance.find();
		    console.log(value);
                    var alliance = alliances.find(a => a.name.toLowerCase().startsWith(value.toLowerCase()) || a.name.toLowerCase().includes(value.toLowerCase()));
console.log(alliance);
                    if (!alliance) {
                        reject(`No alliance found for: <b>${value}</b>`);
                        return;
                    } 
                    intel.alliance_id = alliance.id;
                    break;
                }
                default:
                    reject(`Haven't added that intel command yet: ${key}`);
                    return;
            }
        }
        await intel.save();
        resolve(`Added intel for ${coords.x}:${coords.y}:${coords.z}\n${await output(intel)}`);
    });
};

function output(intel) {
    return new Promise(async (resolve) => {
console.log(intel.alliance_id);
console.log({ _id: `ObjectId(${intel.alliance_id})` });
        let alliance = await Alliance.findOne({ _id: `ObjectId("${intel.alliance_id}")` });
console.log(alliance);
        var alliance_text = ``;
        if (alliance) alliance_text = `Alliance: <b>${alliance.name}</b>`;
        resolve(`Nick: <b>${intel.nick}</b>\n${alliance_text}`);
    });
};

module.exports = {
    "intel": { usage: Intel_usage, description: Intel_desc, cast: Intel_fn }
};


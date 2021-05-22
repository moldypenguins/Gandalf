const Planet = require('./models/planet');

let patterns = [ //Note these are order dependent xyz has to come before xy
	    /([\d]+)\.([\d]+)\.([\d]+)/, //dots
	    /([\d]+):([\d]+):([\d]+)/, // :
	    /([\d]+)\s([\d]+)\s([\d]+)/, // spaces
	    /([\d]+)\.([\d]+)/, //galaxy dots
	    /([\d]+):([\d]+)/, //galaxy :
	    /([\d]+)\s([\d]+)/, //galaxy spaces
];

function parseCoords(input) {
	for (let regex of patterns) {
		let matches = regex.exec(input);
		if (matches) {
			if (matches.length == 4) {
				return {x: +matches[1], y: +matches[2], z: +matches[3]};
			} else if (matches.length == 3) {
				return {x: +matches[1], y: +matches[2]};
			}
		}
	}
	return null;
}

const PLANET_COORD_TYPE = 0, GALAXY_COORD_TYPE = 1;

function coordType(coords) {
	if (coords.x && coords.y && coords.z) {
		return PLANET_COORD_TYPE;
	} else {
		return GALAXY_COORD_TYPE;
	}
}

function coordsToPlanetLookup(input) {
	return new Promise(async (resolve, reject) => {
		let coords = parseCoords(input);
		if (!coords) {
			reject(formatInvalidResponse(input));
			return;
		}

		Planet.find().then((planets) => {
			let planet = planets.find(p => p && p.x && p.y && p.z && p.x == coords.x && p.y == coords.y && p.z == coords.z);
			if (!planet) {
				resolve(null);
				return;
			}
			resolve(planet);
		});
	});
}
    
function formatInvalidResponse(str) {
  return `Sorry I don't know who ${str} or they don't have coords set.`;
}

module.exports = {
	"parseCoords": parseCoords,
	"coordsToPlanetLookup": coordsToPlanetLookup,
	"coordType": coordType,
	"PLANET_COORD_TYPE": PLANET_COORD_TYPE,
	"GALAXY_COORD_TYPE": GALAXY_COORD_TYPE
};




//var id = require('mongodb').ObjectID(doc._id);
//.findOne({_id: new ObjectId(id)}
//.findById("5e12d86186d564bd4487658c", function(err, result) {
























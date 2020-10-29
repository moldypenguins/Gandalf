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
	    for (var regex of patterns) {
		            var matches = regex.exec(input);
		            if (matches) {
				                if (matches.length == 4) {
							                return { x: +matches[1], y: +matches[2], z: +matches[3] };
							            } else if (matches.length == 3) {
									                    return { x: +matches[1], y: +matches[2] };
									                }
				            }
		        }
	    return null;
}

function coordsToPlanetLookup(coordstr) {
	    return new Promise(async (resolve, reject) => {
		          var coords = parseCoords(coordstr);
		          if (!coords) {
				          reject(formatInvalidResponse(coordstr));
				          return;
				        }
		      
		          Planet.find().then((planets) => {
				          var planet = planets.find(p => p && p.x && p.y && p.z && p.x == coords.x && p.y == coords.y && p.z == coords.z);
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
	    "coordsToPlanetLookup": coordsToPlanetLookup
};

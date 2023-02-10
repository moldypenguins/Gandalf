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
 * @name default.ts
 * @version 2023/01/26
 * @summary default configuration file
 **/

import Config from "./Config";

const configDefault: Config = {
  admin: {
    pa_nick: null,
    discord_id: null,
    telegram_id: null
  },
  alliance: {
    name: null,
    attack: {
      default_waves: 3,
      after_land_ticks: 2,
      max_claims: 0
    }
  },
  discord: {
    token: null,
    client_id: null,
    guild_id: null,
    commands: null
  },
  telegram: {
    token: null,
    username: null,
    group_id: null,
    commands: null
  },
  twilio: {
    url: 'https://demo.twilio.com/welcome/voice/',
    sid: null,
    secret: null,
    number: null,
    ring_timeout: 30
  },
  db: {
    url: '127.0.0.1:27017',
    name: 'Mordor',
    user: 'root',
    pass: ''
  },
  web: {
    env: 'prod',
    port: 80,
    url: null,
    session: null,
    default_profile_pic: '/images/member.jpg',
    default_theme: 'affleck',
    themes: {
      affleck: {name: 'Affleck', navbar: 'light'},
      murphy: {name: 'Murphy', navbar: 'dark'},
      shamrock: {name: 'Shamrock', navbar: 'light'},
      telegram: {name: 'Telegram', navbar: 'light'},
      thematrix: {name: 'The Matrix', navbar: 'dark'},
      ultimate: {name: 'Ultimate', navbar: 'dark'},
    }
  },
  access: {
    0: "None",
    1: "Member",
    3: "Commander",
    5: "Administrator",
  },
  roles: {
    0x1: "OOT",
    0x2: "Recruit",
    0x4: "Scanner",
    0x8: "BattleCommander",
    0x16: "DefenceCommander",
    0x32: "HighCommander"
  },
  pa: {
    links: {
      game: 'https://game.planetarion.com',
      scans: 'https://game.planetarion.com/showscan.pl',
      bcalc: 'https://game.planetarion.com/bcalc.pl'
    },
    dumps: {
      ship_stats: 'https://game.planetarion.com/manual.pl?action=statsxml',
      planet: 'https://game.planetarion.com/botfiles/planet_listing.txt',
      galaxy: 'https://game.planetarion.com/botfiles/galaxy_listing.txt',
      alliance: 'https://game.planetarion.com/botfiles/alliance_listing.txt',
      user: 'https://game.planetarion.com/botfiles/user_feed.txt'
    },
    tick: {
      start: 0,
      shuffle: 12,
      protection: 24,
      end: 1177
    },
    numbers: {
      tag_total: 50,
      tag_count: 40,
      roid_value: 200,
      cons_value: 200,
      res_value: 150,
      ship_value: 100,
      xp_value: 60
    },
    ships: {
      min_uni_eta: 8,
      targets: {
        t1: "target1",
        t2: "target2",
        t3: "target3"
      },
      damagetypes: {
        normal: "kill",
        cloak: "kill",
        steal: "steal",
        emp: "hug",
        pod: "capture",
        structure: "destroy"
      },
      targeteffs: {
        "target1": 1,
        "target2": 0.7,
        "target3": 0.5
      },
      classes: {
        fi: "Fighter",
        co: "Corvette",
        fr: "Frigate",
        de: "Destroyer",
        cr: "Cruiser",
        bs: "Battleship"
      },
    },
    roids: {
      maxcap: 0.2,
      mincap: 0,
      mining: 250
    },
    bash: {
      value: 0.4,
      score: 0.6
    },
    governments: {
      corp: {
        name: "Corporatism",
        prodcost: 0,
        mining: 0.24,
        prodtime: 0,
      },
      demo: {
        name: "Democracy",
        prodcost: -0.08,
        mining: 0,
        prodtime: 0,
      },
      nation: {
        name: "Nationalism",
        prodcost: 0,
        mining: 0.16,
        prodtime: -0.10,
      },
      soc: {
        name: "Socialism",
        prodcost: 0,
        mining: 0.1,
        prodtime: 0.2,
      },
      total: {
        name: "Totalitarianism",
        prodcost: -0.06,
        mining: 0,
        prodtime: -0.10,
      },
      anar: {
        name: "Anarchy",
        prodcost: 0,
        mining: -0.25,
        prodtime: -0.20,
      }
    },
    races:{
      ter: {
        number: 1,
        name: "Terran",
        prodtime: 0.1
      },
      cat: {
        number: 2,
        name: "Cathaar",
        prodtime: 0
      },
      xan: {
        number: 3,
        name: "Xandathrii",
        prodtime: 0.05
      },
      zik: {
        number: 4,
        name: "Zikonian",
        prodtime: 0.15
      },
      /*
      etd: {
        name: "Eitraides",
        prodtime: 0
      }
      */
      kin: {
        number: 5,
        name: "Kinthia",
        prodtime: 0
      },   
      sly: {
        number: 6,
        name: "Slythonian",
        prodtime: 0
      }    
    },
    construction: {
      baseRefCost: 3000,
      baseFCCost: 4500,
      refIncome: 1100,
      fcBonus: 0.005,
      refCU: 750,
      fcCU: 1000,
    },
    cores: [1000, 3500, 7000, 12500, 20000],
    scans: {
      P: {
        name: "Planet Scan",
        best_before: 3,
        expiry: 5,
        request: true,
      },
      L: {
        name: "Landing Scan",
        best_before: 3,
        expiry: 5,
        request: false,
      },
      D: {
        name: "Development Scan",
        best_before: 3,
        expiry: 5,
        request: true,
      },
      U: {
        name: "Unit Scan",
        best_before: 3,
        expiry: 5,
        request: true,
      },
      N: {
        name: "News Scan",
        best_before: 3,
        expiry: 5,
        request: true,
      },
      I: {
        name: "Incoming Scan",
        best_before: 3,
        expiry: 5,
        request: false,
      },
      J: {
        name: "Jumpgate Probe",
        best_before: 1,
        expiry: 3,
        request: true,
      },
      A: {
        name: "Advanced Unit Scan",
        best_before: 3,
        expiry: 5,
        request: true,
      },
      M: {
        name: "Military Scan",
        best_before: 1,
        expiry: 3,
        request: true,
      }
    }
  }
}

export default configDefault



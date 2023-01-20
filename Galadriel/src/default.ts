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
 * @version 2023/01/20
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
    0x2: "Scanner",
    0x4: "BattleCommander",
    0x8: "DefenceCommander",
    0x16: "HighCommander"
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
      tag_total: 60,
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
  }
}

export default configDefault



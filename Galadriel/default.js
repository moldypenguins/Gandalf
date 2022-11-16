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
 * @name default.js
 * @version 2022/10/24
 * @summary default configuration file
 **/
'use strict';

module.exports = {
  config: {
    alliance: {
      name: undefined,
      attack: {
        default_waves: 3,
        after_land_ticks: 2,
        max_claims: null  //null for unlimited
      }
    },
    discord: {
      token: undefined,
      client_id: undefined,
      guild_id: undefined,
      commands: undefined
    },
    telegram: {
      token: undefined,
      username: undefined,
      group_id: undefined,
      commands: undefined
    },
    twilio: {
      url: 'https://demo.twilio.com/welcome/voice/',
      sid: undefined,
      secret: undefined,
      number: undefined,
      ring_timeout: 30 //seconds
    },
    db: {
      uri: 'mongodb://localhost:27017',
      name: 'Mordor'
    },
    web: {
      uri: undefined,
      session: undefined,
      default_profile_pic:'/images/member.jpg',
      default_theme: 'affleck',
      themes: {
        affleck: {name: 'Affleck', navbar: 'light'},
        shamrock: {name: 'Shamrock', navbar: 'light'},
        telegram: {name: 'Telegram', navbar: 'light'},
        thematrix: {name: 'The Matrix', navbar: 'dark'},
        ultimate: {name: 'Ultimate', navbar: 'dark'},
      }
    },
    access:{
      0:"Recruit",        //gives access to:
      //basic dashboard page
      //basic universe pages (no intel)
      //attacks (cannot see claimant names)
      1:"Member",         //gives access to:
      //extended dashboard page
      //strategy pages
      //extended universe pages (with intel)
      //attacks (can see claimant names)
      //scanner role
      3:"Commander",      //gives access to:
      //commander roles
      5:"Administrator"   //gives access to:
      //everything
    },
    roles:{
      0x1:"OOT",               //marks OOT members (must be at least member)
      0x2:"Scanner",           //gives access to: Scan shit (must be at least member)
      0x4:"Battle Commander",  //gives access to: BC shit (must be at least commander)
      0x8:"Defence Commander", //gives access to: DC shit (must be at least commander)
      0x16:"High Commander"     //gives access to: HC shit (must be at least commander)
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
      ships:{
        min_uni_eta: 8,
        targets:{
          t1: "target1",
          t2: "target2",
          t3: "target3"
        },
        damagetypes:{
          normal: "kill",
          cloak: "kill",
          steal: "steal",
          emp: "hug",
          pod: "capture",
          structure: "destroy"
        },
        targeteffs:{
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
};

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
 * @name config.d.ts
 * @version 2022/11/16
 * @summary configuration declaration file
 **/

export default interface Configuration {
  alliance: {
    name: string;
    attack?: {
      default_waves?: number;
      after_land_ticks?: number;
      max_claims?: number;
    }
  };
  discord?: {
    owner: string,
    token: string;
    client_id: string;
    guild_id: string;
    commands: string[];
  };
  telegram?: {
    owner: string,
    token: string;
    username: string;
    group_id: string;
    commands: string[];
  };
  twilio?: {
    url?: string;
    sid: string;
    secret: string;
    number: string;
    ring_timeout?: number;
  };
  db?: {
    uri?: string;
    name?: string;
  },
  web: {
    port?: number;
    uri: string;
    session: string;
    default_profile_pic?: string;
    default_theme: string;
    themes?: { [key: string]: { name: string; navbar: string }; }
  },
  access?: { [key: number]: string; },
  roles?:{ [key: number]: string; },
  pa?: {
    links?: { [key: string]: string; },
    dumps?: { [key: string]: string; },
    tick?: { [key: string]: number; },
    numbers?: { [key: string]: number; },
    ships?:{
      min_uni_eta?: number;
      targets?:{ [key: string]: string; },
      damagetypes?:{ [key: string]: string; },
      targeteffs?:{ [key: string]: number; },
      classes?: { [key: string]: string; },
    },
    roids?: { [key: string]: number; },
    bash?: { [key: string]: number; },
  }
}

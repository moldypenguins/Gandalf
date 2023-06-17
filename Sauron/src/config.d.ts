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
 * @name Config.d.ts
 * @version 2023/01/26
 * @summary configuration declaration
 **/

export default interface Config {
  admin: {
    pa_nick: string | null;
    discord_id?: string | null;
    telegram_id?: string | null;
  }
  discord?: {
    token: string | null;
    client_id: string | null;
    guild_id: string | null;
    channel_id: string | null;
    commands: string[] | null;
  };
  telegram?: {
    token: string | null;
    username: string | null;
    group_id: string | null;
    commands: string[] | null;
  };
  db?: {
    url?: string;
    name?: string;
    user?: string;
    pass?: string;
  },
  access?: { [key: number]: string; },
  roles?: { [key: number]: string; },
  pa?: {
    links?: { [key: string]: string; },
    dumps?: { [key: string]: string; },
    tick?: { [key: string]: number; },
    numbers?: { [key: string]: number; },
    ships?: {
      min_uni_eta?: number;
      targets?: { [key: string]: string; },
      damagetypes?: { [key: string]: string; },
      targeteffs?: { [key: string]: number; },
      classes?: { [key: string]: string; },
    },
    roids?: { [key: string]: number; },
    bash?: { [key: string]: number; },
    governments?: {
      [key: string]: {
        name: string;
        prodcost: number;
        mining: number;
        prodtime: number;
      };
    },
    races?: {
      [key: string]: {
        number: number,
        name: string,
        prodtime: number
      };
    },
    construction?: { [key: string]: number },
    cores?: number[],
    scans?: {
      [key: string]: {
        name: string,
        best_before: number,
        expiry: number,
        request: boolean
      }
    }
  }
}

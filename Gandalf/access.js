'use strict';
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
 * @name access.js
 * @version 2023/02/03
 * @summary Gandalf User Access
 **/


const Access = {
  Admin: (mem) => {
    return mem.access === 5;
  },
  HighCommand: (mem) => {
    return mem.access === 5 || (mem.access >= 3 && (mem.roles & 16) !== 0);
  },
  DefenceCommand: (mem) => {
    return mem.access === 5 || mem.access >= 3 && (mem.roles & 8) !== 0;
  },
  BattleCommand: (mem) => {
    return mem.access === 5 || mem.access >= 3 && (mem.roles & 4) !== 0;
  },
  Command: (mem) => {
    return mem.access >= 3;
  },
  Scanner: (mem) => {
    return mem.access === 5 || mem.access >= 1 && (mem.roles & 2) !== 0;
  },
  Member: (mem) => {
    return mem.access >= 1;
  }
}

export default Access

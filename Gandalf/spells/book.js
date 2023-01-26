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
 * @name book.js
 * @version 2023/01/22
 * @summary Spell Book
 **/


import addmember from './addmember.js';
import bonus from './bonus.js';
import cost from './cost.js';
import eff from './eff.js';
import launch from './launch.js';
import links from './links.js';
import roidcost from './roidcost.js';
import ship from './ship.js';
import stop from './stop.js';
import tick from './tick.js';





const Spells =  {
  addmember,
  bonus,
  cost,
  eff,
  launch,
  links,
  roidcost,
  ship,
  stop,
  tick
};

export default Spells

"use strict";
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
 * @version 2023/01/25
 * @summary Spell Book
 **/


import cost from "./cost.js";
import eff from "./eff.js";
import exile from "./exile.js";
import launch from "./launch.js";
import prodtime from "./prodtime.js";
import roidcost from "./roidcost.js";
import stop from "./stop.js";
import ship from "./ship.js";
import tick from "./tick.js";


const Spells =  {
    cost,
    eff,
    exile,
    launch,
    prodtime,
    roidcost,
    stop,
    ship,
    tick
};

export default Spells;

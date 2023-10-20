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
 * @name prodtime.js
 * @version 2023/01/21
 * @summary Gandalf Spells
 **/

import util from "util";
import Config from "sauron";
import { Mordor, Ship } from "mordor";
import Spells from "../Spells/Book.js";
import Access from "../access.js";

import { Context } from "telegraf";

import { encode } from "html-entities";
import numeral from "numeral";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);



export default {
    access: null,
    usage: encode("/prodtime <total resources> <factories> <race> [govt] [pop bonus]"),
    description: "Calculate ticks taken to produce ships costing &lt;total resources&gt; (Default: Soc, 60 pop).",
    telegram: {
        async execute(ctx, args) {
            return new Promise(async (resolve, reject) => {
                let _p1 = numeral(args[0]).value();
                let _p2 = numeral(args[1]).value();
                let _p3 = args[2];
                let _p4 = args[3];
                let _p5 = args[4];
                resolve(await Spells.prodtime({resources: _p1, factories: _p2, race: _p3, govt: _p4, pop_bonus: _p5}));
            });
        }

    }
};

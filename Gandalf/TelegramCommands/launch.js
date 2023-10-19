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
 * @name launch.js
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
    usage: encode("/launch <class|eta> <LT> [timezone]"),
    description: "Calculates when ships should be launched to land at LT.",
    telegram: {
        async execute(ctx, args) {
            return new Promise(async (resolve, reject) => {
                if(typeof(args[0]) == "undefined" || typeof(args[1]) == "undefined") {
                    reject("Missing parameter.");
                } else {
                    let _eta = numeral(args[0]).value();
                    if (_eta == null) {
                        reject("ETA must be a valid number.");
                    }
                    let _lt = args[1];
                    _lt = numeral(_lt).value();
                    if (_lt == null) {
                        reject("LT must be a valid number.");
                    }
                    resolve(await Spells.launch({eta: _eta, lt: _lt, tz: args[2]}));
                }
            });
        }
    }
};

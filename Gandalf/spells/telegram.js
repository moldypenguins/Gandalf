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
 * @name telegram.js
 * @version 2022/11/17
 * @summary Spells
 **/
'use strict';

import { telegram as tick } from './tick.js';
import { telegram as links } from './links.js';
import { telegram as launch } from './launch.js';
import { telegram as ship } from './ship.js';
import { telegram as addmem } from './addmem.js';

export default {
  tick,
  links,
  launch,
  ship,
  addmem
};

/*
const commandArgs = () => (ctx, next) => {
    if (ctx.updateType === 'message' && ctx.updateSubType === 'text') {
        const text = ctx.update.message.text.toLowerCase();
        if (text.startsWith('/')) {
            const match = text.match(/^\/([^\s]+)\s?(.+)?/);
            let args = [];
            let command;
            if (match !== null) {
                if (match[1]) {
                    command = match[1];
                }
                if (match[2]) {
                    args = match[2].split(' ');
                }
            }

            ctx.state.command = {
                raw: text,
                command,
                args,
            };
        }
    }
    return next();
};

module.exports = commandArgs;
 */

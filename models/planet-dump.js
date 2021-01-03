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
 **/
const Mordor = require('../Mordor');

let planetDumpSchema = Mordor.Schema({
  planet_id: { type: String },
  id: { type: String },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  planetname: { type: String },
  rulername: { type: String },
  race: { type: String },
  size: { type: Number },
  score: { type: Number },
  value: { type: Number },
  xp: { type: Number }
});

module.exports = Mordor.model('PlanetDump', planetDumpSchema, 'PlanetDumps');


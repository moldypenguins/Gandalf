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
 * @name Member.js
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
'use strict';

const Mordor = require('../Mordor');

let developmentScanSchema = Mordor.Schema({
  scan_id: {type: String, index: true},
  light_factory: Number,
  medium_factory: Number,
  heavy_factory: Number,
  wave_amplifier: Number,
  wave_distorter: Number,
  metal_refinery: Number,
  crystal_refinery: Number,
  eonium_refinery: Number,
  research_lab: Number,
  finance_centre: Number,
  military_centre: Number,
  security_centre: Number,
  structure_defence: Number,
  travel: Number,
  infrastructure: Number,
  hulls: Number,
  waves: Number,
  core: Number,
  covert_op: Number,
  mining: Number,
  population: Number
});

module.exports = Mordor.model('DevelopmentScan', developmentScanSchema, 'DevelopmentScans');


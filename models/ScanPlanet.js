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

let planetScanSchema = Mordor.Schema({
  scan_id: {type: String, index: true},
  roid_metal: Number,
  roid_crystal: Number,
  roid_eonium: Number,
  res_metal: Number,
  res_crystal: Number,
  res_eonium: Number,
  factory_usage_light: String,
  factory_usage_medium: String,
  factory_usage_heavy: String,
  prod_res: Number,
  ships_sold_res: Number,
  agents: Number,
  guards: Number
});

module.exports = Mordor.model('PlanetScan', planetScanSchema, 'PlanetScans');

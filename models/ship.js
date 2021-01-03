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

let ShipSchema = Mordor.Schema({
  id:         {type:Number, unique:true, required:true},
  name:       {type:String, index:true},
  race:       String,
  class:      String,
  target1:    String,
  target2:    String,
  target3:    String,
  type:       String,
  initiative: String,
  guns:       String,
  armor:      String,
  damage:     String,
  empres:     String,
  metal:      String,
  crystal:    String,
  eonium:     String,
  armorcost:  String,
  damagecost: String,
  baseeta:    String
});

module.exports = Mordor.model('Ship', ShipSchema, 'Ships');

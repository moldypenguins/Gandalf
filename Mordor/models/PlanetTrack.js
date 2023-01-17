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
 * @name PlanetTrack.js
 * @version 2021/06/02
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let PlanetTrackSchema = new mongoose.Schema({
  _id:         {type:mongoose.Schema.Types.ObjectId, required:true},
  planet:      {type:mongoose.Schema.Types.ObjectId, ref:'Planet'},
  //planet_id: {type:String},
  tick:        {type:mongoose.Schema.Types.ObjectId, ref:'Tick'},
  //tick:      {type:Number},
  old_x:       {type:Number},
  old_y:       {type:Number},
  old_z:       {type:Number},
  new_x:       {type:Number},
  new_y:       {type:Number},
  new_z:       {type:Number},
});

module.exports = mongoose.model('PlanetTrack', PlanetTrackSchema, 'PlanetTracks');

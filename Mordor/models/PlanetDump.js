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
 * @name PlanetDump.js
 * @version 2021/05/30
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let PlanetDumpSchema = new mongoose.Schema({
  _id:        {type:mongoose.Schema.Types.ObjectId, required:true},
  planet_id:  {type:String, index:true},
  x:          {type:Number, required:true},
  y:          {type:Number, required:true},
  z:          {type:Number, required:true},
  planetname: {type:String, required:true, trim:true},
  rulername:  {type:String, required:true, trim:true},
  race:       {type:String},
  size:       {type:Number, index:true},
  score:      {type:Number, index:true},
  value:      {type:Number, index:true},
  xp:         {type:Number, index:true},
  special:    {type: String},
});

export default mongoose.model('PlanetDump', PlanetDumpSchema, 'PlanetDumps');

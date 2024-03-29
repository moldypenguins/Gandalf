'use strict';
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
 * @name GalaxyDump.js
 * @version 2021/05/30
 * @summary Mongoose Model
 **/

import mongoose from 'mongoose';

let GalaxyDumpSchema = new mongoose.Schema({
  _id:       {type:mongoose.Schema.Types.ObjectId, required:true},
  x:         {type:Number, required:true},
  y:         {type:Number, required:true},
  name:      {type:String, required:true, trim:true},
  size:      {type:Number},
  score:     {type:Number},
  value:     {type:Number},
  xp:        {type:Number},
});

export default mongoose.model('GalaxyDump', GalaxyDumpSchema, 'GalaxyDumps');

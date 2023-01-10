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
 * @name AllianceDump.js
 * @version 2022/11/06
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let AllianceDumpSchema = new mongoose.Schema({
  _id:           {type:mongoose.Schema.Types.ObjectId, required:true},
  rank:          {type:Number, required:true},
  name:          {type:String, required:true, trim:true},
  size:          {type:Number},
  members:       {type:Number},
  counted_score: {type:Number},
  points:        {type:Number},
  total_score:   {type:Number},
  total_value:   {type:Number},
});

export default mongoose.model('AllianceDump', AllianceDumpSchema, 'AllianceDumps');

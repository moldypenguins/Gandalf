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
 * @name HeroPower.js
 * @version 2023/02/01
 * @summary Mongoose Model
 **/

import Config from 'Galadriel/src/galadriel.ts';
import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

let HeroPowerSchema = new mongoose.Schema({
  _id:     {type:mongoose.Schema.Types.ObjectId, required:true},
  tick:    {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Tick', autopopulate: true},
  member:  {type:mongoose.Schema.Types.ObjectId, required:true, ref:'User', autopopulate: true},
  size:    {type:Number, required:true},
  rank:    {type:Number, required:true},
  members: {type:Number, required:true}
});


HeroPowerSchema.plugin(mongooseAutoPopulate);

export default mongoose.model('HeroPower', HeroPowerSchema, 'HeroPowers');

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
 * @name DiscordUser.js
 * @version 2021/11/14
 * @summary Mongoose Model
 **/


import Config from 'Galadriel/src/galadriel.ts';
import mongoose from 'mongoose';

let DiscordUserSchema = new mongoose.Schema({
  _id:                  {type:mongoose.Schema.Types.ObjectId, required:true},
  dsuser_id:            {type:Number, unique:true, required:true},
  dsuser_first_name:    {type:String},
  dsuser_last_name:     {type:String},
  dsuser_username:      {type:String},
  dsuser_photo_url:     {type:String},
  dsuser_language_code: {type:String},
});

export default mongoose.model('DiscordUser', DiscordUserSchema, 'DiscordUsers');

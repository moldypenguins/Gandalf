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
 * @name DiscordUser.js
 * @version 2021/11/14
 * @summary Mongoose Model
 **/
'use strict';

process.env.NODE_CONFIG_DIR = '../../Galadriel';
import * as config from 'config';
import mongoose from 'mongoose';

const Config = config.get('config');

let DiscordUserSchema = new mongoose.Schema({
  _id:                   {type:mongoose.Schema.Types.ObjectId, required:true},
  DiscordUser_id:            {type:Number, unique:true, required:true},
  DiscordUser_first_name:    {type:String},
  DiscordUser_last_name:     {type:String},
  DiscordUser_username:      {type:String},
  DiscordUser_photo_url:     {type:String, default:Config.web.uri + '/' + Config.web.default_profile_pic},
  DiscordUser_language_code: {type:String},
});

export default mongoose.model('DiscordUser', DiscordUserSchema, 'DiscordUsers');

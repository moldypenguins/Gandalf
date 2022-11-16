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
 * @name TelegramUser.js
 * @version 2021/07/11
 * @summary Mongoose Model
 **/
'use strict';

process.env["NODE_CONFIG_DIR"] = '../../Galadriel';

const Config = require('config').get('config');
const Mordor  = require('mongoose');

let TelegramUserSchema = new Mordor.Schema({
  _id:                   {type:Mordor.Schema.Types.ObjectId, required:true},
  TelegramUser_id:            {type:Number, unique:true, required:true},
  TelegramUser_first_name:    {type:String},
  TelegramUser_last_name:     {type:String},
  TelegramUser_username:      {type:String},
  TelegramUser_photo_url:     {type:String, default:Config.web.uri + '/' + Config.web.default_profile_pic},
  TelegramUser_language_code: {type:String},
});

/*
TelegramUserSchema.virtual('tg_name')
.get(function() {
  let mention_name = this.tg_first_name;
  if(this.tg_username) {
    mention_name = this.tg_username;
  } else if(this.tg_last_name) {
    mention_name = `${this.tg_first_name} ${this.tg_last_name}`;
  }
  return mention_name;
});
*/

module.exports = Mordor.model('TelegramUser', TelegramUserSchema, 'TelegramUsers');

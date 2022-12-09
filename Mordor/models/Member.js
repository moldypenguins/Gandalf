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
 * @version 2021/11/22
 * @summary Mongoose Model
 **/
'use strict';

import Config from 'galadriel';
import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import {TelegramUser} from "../mordor.js";

let MemberSchema = new mongoose.Schema({
  _id:             {type:mongoose.Schema.Types.ObjectId, required:true},
  pa_nick:         {type:String, trim:true, unique:true, index:true, required:true},
  tg_user:         {type:mongoose.Schema.Types.ObjectId, ref:'TelegramUser', autopopulate: true},
  ds_user:         {type:mongoose.Schema.Types.ObjectId, ref:'DiscordUser'},
  access:          {type:Number, default:0, required:true},
  roles:           {type:Number, default:0, required:true},
  parent:          {type:mongoose.Schema.Types.ObjectId, ref:'Member'},
  birthed:         {type:Date, default:Date.now(), required:true},
  photo_url:       {type:String, default:Config.web.uri + '/' + Config.web.default_profile_pic},
  site_theme:      {type:String, default:'default', required:true},
  site_navigation: {type:String, default:'iconstext', required:true},
  last_access:     {type:Date},
  timezone:        {type:String},
  email:           {type:String},
  phone:           {type:String},
  planet:          {type:mongoose.Schema.Types.ObjectId, ref:'Planet', autopopulate: true},
});

MemberSchema.statics.findByTGUser = async function(tg_user) {
  return await this.findOne({tg_user: tg_user});
}

MemberSchema.statics.findByTGId = async function(tg_id) {
  return await TelegramUser.exists({tg_id: tg_id}) ? await this.findOne({tg_user: await TelegramUser.findOne({tg_id: tg_id})}) : null;
}

MemberSchema.plugin(mongooseAutoPopulate);

export default mongoose.model('Member', MemberSchema, 'Members');

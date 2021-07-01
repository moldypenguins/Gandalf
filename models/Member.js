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
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
'use strict';

const CFG = require('../Config');
const Mordor = require('../Mordor');

let MemberSchema = new Mordor.Schema({
  _id:             {type:Mordor.Schema.Types.ObjectId, required:true},
  pa_nick:         {type:String, trim:true, unique:true, index:true, required:true},
  telegram_user:   {type:Mordor.Schema.Types.ObjectId, ref:'TelegramUser'},
  discord_user:    {type:Mordor.Schema.Types.ObjectId, ref:'DiscordUser'},
  access:          {type:Number, default:0, required:true},
  roles:           {type:Number, default:0, required:true},
  parent:          {type:Mordor.Schema.Types.ObjectId, ref:'Member'},
  birthed:         {type:Date, default:Date.now(), required:true},
  photo_url:       {type:String, default:CFG.web.uri + '/' + CFG.web.default_profile_pic},
  site_theme:      {type:String, default:'default', required:true},
  site_navigation: {type:String, default:'iconstext', required:true},
  last_access:     {type:Date},
  timezone:        {type:String},
  email:           {type:String},
  phone:           {type:String},
  planet:          {type:String, ref:'Planet'},
},
{
  toJSON: { virtuals: true }
});


// Virtual populate
MemberSchema.virtual("TelegramUsers", {
  ref: "TelegramUser",
  foreignField: "telegram_id",
  localField: "telegram_user",
  justOne: true
});


MemberSchema.statics.findByTelegramUser = async function(telegram_user) {
  return await this.findOne({telegram_user: telegram_user._id});
}

module.exports = Mordor.model('Member', MemberSchema, 'Members');

"use strict";
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
 * @name TelegramUser.js
 * @version 2021/07/11
 * @summary Mongoose Model
 **/


import mongoose from "mongoose";

let TelegramUserSchema = new mongoose.Schema({
    _id:              {type:mongoose.Schema.Types.ObjectId, required:true},
    tguser_id:            {type:Number, unique:true, required:true},
    tguser_first_name:    {type:String},
    tguser_last_name:     {type:String},
    tguser_username:      {type:String},
    tguser_language_code: {type:String},
    tguser_photo_url:     {type:String},
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

export default mongoose.model("TelegramUser", TelegramUserSchema, "TelegramUsers");

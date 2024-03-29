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
 * @name User.js
 * @version 2023/02/03
 * @summary Mongoose Model
 **/

import Config from "sauron";
import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import {DiscordUser, TelegramUser} from "../mordor.js";

let UserSchema = new mongoose.Schema({
    _id:             {type:mongoose.Schema.Types.ObjectId, required:true},
    pa_nick:         {type:String, trim:true, unique:true, index:true, required:true},
    ds_user:         {type:mongoose.Schema.Types.ObjectId, ref:"DiscordUser", autopopulate: true},
    tg_user:         {type:mongoose.Schema.Types.ObjectId, ref:"TelegramUser", autopopulate: true},
    access:          {type:Number, default:0, required:true},
    roles:           {type:Number, default:0, required:true},
    parent:          {type:mongoose.Schema.Types.ObjectId, ref:"User"},
    birthed:         {type:Date, default:Date.now(), required:true},
    last_access:     {type:Date},
    timezone:        {type:String},
    planet:          {type:mongoose.Schema.Types.ObjectId, ref:"Planet", autopopulate: true}
});

UserSchema.statics.findByTGUser = async function(tg_user) {
    return await this.findOne({tg_user: tg_user});
};

UserSchema.statics.findByTGId = async function(tg_id) {
    return await TelegramUser.exists({tguser_id: tg_id}) ? await this.findOne({tg_user: await TelegramUser.findOne({tguser_id: tg_id})}) : null;
};

UserSchema.statics.findByDSUser = async function(ds_user) {
    return await this.findOne({ds_user: ds_user});
};

UserSchema.statics.findByDSId = async function(ds_id) {
    return await DiscordUser.exists({dsuser_id: ds_id}) ? await this.findOne({ds_user: await DiscordUser.findOne({dsuser_id: ds_id})}) : null;
};

UserSchema.plugin(mongooseAutoPopulate);

export default mongoose.model("User", UserSchema, "Users");

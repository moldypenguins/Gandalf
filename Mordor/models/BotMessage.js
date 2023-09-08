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
 * @name BotMessage.js
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
"use strict";

import mongoose from "mongoose";
import dayjs from "dayjs";

let BotMessageSchema = new mongoose.Schema({
    _id:         {type:mongoose.Schema.Types.ObjectId, required:true},
    tick:        {type:mongoose.Schema.Types.ObjectId, ref:"Tick", autopopulate: true},
    title:       {type:String},
    description: {type:String},
    timestamp:   {type:Date, default: () => dayjs().utc().minute(0).second(0).millisecond(0)},
    sent:        {type:Boolean, default: false}
});


export default mongoose.model("BotMessage", BotMessageSchema, "BotMessages");

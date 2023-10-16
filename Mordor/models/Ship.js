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
 * @name Ship.js
 * @version 2021/06/12
 * @summary Mongoose Model
 **/

import mongoose from "mongoose";

let ShipSchema = new mongoose.Schema({
    _id:        {type:mongoose.Schema.Types.ObjectId, required:true},
    ship_id:    {type:Number, unique:true, required:true},
    name:       {type:String, index:true, required:true},
    race:       {type:String, required:true},
    class:      {type:String, required:true},
    target1:    {type:String},
    target2:    {type:String},
    target3:    {type:String},
    type:       {type:String},
    cloaked:    {type:Boolean},
    initiative: {type:Number},
    guns:       {type:Number},
    armor:      {type:Number},
    damage:     {type:Number},
    empres:     {type:Number},
    metal:      {type:Number},
    crystal:    {type:Number},
    eonium:     {type:Number},
    armorcost:  {type:Number},
    damagecost: {type:Number},
    baseeta:    {type:Number}
});

export default mongoose.model("Ship", ShipSchema, "Ships");

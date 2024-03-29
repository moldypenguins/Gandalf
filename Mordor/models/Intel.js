'use strict';
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
 * @name Intel.js
 * @version 2021/06/02
 * @summary Mongoose Model
 **/


import mongoose from 'mongoose';
import {TelegramUser} from "../mordor.js";

let IntelSchema = new mongoose.Schema({
  _id:         {type:mongoose.Schema.Types.ObjectId, required:true},
  planet:      {type:mongoose.Schema.Types.ObjectId, ref:'Planet', autopopulate: true},
  alliance:    {type:mongoose.Schema.Types.ObjectId, ref:'Alliance', autopopulate: true},
  amps:        {type:Number},
  dists:       {type:Number},
  nick:        {type:String},
  /*
  fakenick:    {type:String},
  defwhore:    {type:Boolean},
  covop:       {type:Boolean},
  bg:          {type:String},
  gov:         {type:String},
  relay:       {type:Boolean},
  reportchan:  {type:String},
  comment:     {type:String},
  */
});


IntelSchema.statics.findByPlanet = async function(planet) {
  return await this.findOne({planet: planet});
}

IntelSchema.statics.findByAlliance = async function(alliance) {
  return await this.find({alliance: alliance});
}

IntelSchema.plugin(require('mongoose-autopopulate'));

export default mongoose.model('Intel', IntelSchema, 'Intel');

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
 * @name PlanetHistory.js
 * @version 2021/06/01
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let PlanetHistorySchema = new mongoose.Schema({
  _id:        {type:mongoose.Schema.Types.ObjectId, required:true},
  tick:       {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Tick'},
  planet_id:  {type:String, index:true, required:true},
  x:          {type:Number, required:true},
  y:          {type:Number, required:true},
  z:          {type:Number, required:true},
  planetname: {type:String, required:true, trim:true},
  rulername:  {type:String, required:true, trim:true},
  race:       {type:String},
  size:       {type:Number},
  score:      {type:Number},
  value:      {type:Number},
  xp:         {type:Number},
  active:     {type:Boolean},
  age:        {type:Number},
  ratio:      {type:Number},
  size_rank: {type:Number},
  score_rank: {type:Number},
  value_rank: {type:Number},
  xp_rank: {type:Number},
  size_growth: {type:Number},
  score_growth: {type:Number},
  value_growth: {type:Number},
  xp_growth: {type:Number},
  /*
  size_growth_pc: Number,
  score_growth_pc: Number,
  value_growth_pc: Number,
  xp_growth_pc: Number,
  size_rank_change: Number,
  score_rank_change: Number,
  value_rank_change: Number,
  xp_rank_change: Number,
  totalroundroids: Number,
  totallostroids: Number,
  totalroundroids_rank: Number,
  totallostroids_rank: Number,
  totalroundroids_rank_change: Number,
  totallostroids_rank_change: Number,
  totalroundroids_growth: Number,
  totallostroids_growth: Number,
  totalroundroids_growth_pc: Number,
  totallostroids_growth_pc: Number,
  ticksroiding: Number,
  ticksroided: Number,
  tickroids: Number,
  avroids: Number,
  roidxp: Number,
  vdiff: Number,
  sdiff: Number,
  xdiff: Number,
  rdiff: Number,
  vrankdiff: Number,
  srankdiff: Number,
  xrankdiff: Number,
  rrankdiff: Number,
  idle: Number,
  cluster_size_rank: Number,
  cluster_score_rank: Number,
  cluster_value_rank: Number,
  cluster_xp_rank: Number,
  cluster_size_rank_change: Number,
  cluster_score_rank_change: Number,
  cluster_value_rank_change: Number,
  cluster_xp_rank_change: Number,
  cluster_totalroundroids_rank: Number,
  cluster_totallostroids_rank: Number,
  cluster_totalroundroids_rank_change: Number,
  cluster_totallostroids_rank_change: Number,
  galaxy_size_rank: Number,
  galaxy_score_rank: Number,
  galaxy_value_rank: Number,
  galaxy_xp_rank: Number,
  galaxy_size_rank_change: Number,
  galaxy_score_rank_change: Number,
  galaxy_value_rank_change: Number,
  galaxy_xp_rank_change: Number,
  galaxy_totalroundroids_rank: Number,
  galaxy_totallostroids_rank: Number,
  galaxy_totalroundroids_rank_change: Number,
  galaxy_totallostroids_rank_change: Number,
  race_size_rank: Number,
  race_score_rank: Number,
  race_value_rank: Number,
  race_xp_rank: Number,
  race_size_rank_change: Number,
  race_score_rank_change: Number,
  race_value_rank_change: Number,
  race_xp_rank_change: Number,
  race_totalroundroids_rank: Number,
  race_totallostroids_rank: Number,
  race_totalroundroids_rank_change: Number,
  race_totallostroids_rank_change: Number,
  size_highest_rank: Number,
  size_highest_rank_tick: Number,
  size_lowest_rank: Number,
  size_lowest_rank_tick: Number,
  score_highest_rank: Number,
  score_highest_rank_tick: Number,
  score_lowest_rank: Number,
  score_lowest_rank_tick: Number,
  value_highest_rank: Number,
  value_highest_rank_tick: Number,
  value_lowest_rank: Number,
  value_lowest_rank_tick: Number,
  xp_highest_rank: Number,
  xp_highest_rank_tick: Number,
  xp_lowest_rank: Number,
  xp_lowest_rank_tick: Number,
  */
});

export default mongoose.model('PlanetHistory', PlanetHistorySchema, 'PlanetHistories');

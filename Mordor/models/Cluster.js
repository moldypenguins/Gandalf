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
 * @name Cluster.js
 * @version 2021/05/30
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let ClusterSchema = new mongoose.Schema({
  _id:      {type:mongoose.Schema.Types.ObjectId, required:true},
  x:        {type:Number, required:true},
  size:     {type:Number, default:0},
  score:    {type:Number, default:0},
  value:    {type:Number, default:0},
  xp:       {type:Number, default:0},
  active:   {type:Boolean, default:true},
  age:      {type:Number, default:0},
  galaxies: {type:Number, default:0},
  planets:  {type:Number, default:0},
  ratio:    {type:Number, default:0},

  size_rank: {type:Number},
  score_rank: {type:Number},
  value_rank: {type:Number},
  xp_rank: {type:Number},
  size_growth: {type:Number},
  score_growth: {type:Number},
  value_growth: {type:Number},
  xp_growth: {type:Number},
  galaxy_growth: {type:Number},
  planet_growth: {type:Number},
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
  mdiff: Number,
  vrankdiff: Number,
  srankdiff: Number,
  xrankdiff: Number,
  rrankdiff: Number,
  idle: Number,
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
  xp_lowest_rank_tick: Number
  */
});

export default mongoose.model('Cluster', ClusterSchema, 'Clusters');

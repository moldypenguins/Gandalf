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
 * @name AllianceHistory.js
 * @version 2021/06/01
 * @summary Mongoose Model
 **/
'use strict';

const Mordor = require('../Mordor');

let AllianceHistorySchema = new Mordor.Schema({
  _id:        {type:Mordor.Schema.Types.ObjectId, required:true},
  tick:       {type:Mordor.Schema.Types.ObjectId, required:true, reference:'Tick'},
  name:       {type:String, required:true, trim:true},
  size:       {type:Number},
  members:    {type:Number},
  score:      {type:Number},
  points:     {type:Number},
  score_rank: {type:Number},
  size_avg:   {type:Number},
  score_avg:  {type:Number},
  points_avg: {type:Number},
  alias:      {type:String, trim:true},
  active:     {type:Boolean},
  age:        {type:Number},
  ratio:      {type:Number},
  /*
  size_rank: Number,
  members_rank: Number,
  score_rank: Number,
  points_rank: Number,
  size_avg: Number,
  score_avg: Number,
  points_avg: Number,
  size_avg_rank: Number,
  score_avg_rank: Number,
  points_avg_rank: Number,
  size_growth: Number,
  score_growth: Number,
  points_growth: Number,
  member_growth: Number,
  size_growth_pc: Number,
  score_growth_pc: Number,
  points_growth_pc: Number,
  size_avg_growth: Number,
  score_avg_growth: Number,
  points_avg_growth: Number,
  size_avg_growth_pc: Number,
  score_avg_growth_pc: Number,
  points_avg_growth_pc: Number,
  size_rank_change: Number,
  members_rank_change: Number,
  score_rank_change: Number,
  points_rank_change: Number,
  size_avg_rank_change: Number,
  score_avg_rank_change: Number,
  points_avg_rank_change: Number,
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
  sdiff: Number,
  pdiff: Number,
  rdiff: Number,
  mdiff: Number,
  srankdiff: Number,
  prankdiff: Number,
  rrankdiff: Number,
  mrankdiff: Number,
  savgdiff: Number,
  pavgdiff: Number,
  ravgdiff: Number,
  savgrankdiff: Number,
  pavgrankdiff: Number,
  ravgrankdiff: Number,
  idle: Number,
  size_highest_rank: Number,
  size_highest_rank_tick: Number,
  size_lowest_rank: Number,
  size_lowest_rank_tick: Number,
  members_highest_rank: Number,
  members_highest_rank_tick: Number,
  members_lowest_rank: Number,
  members_lowest_rank_tick: Number,
  score_highest_rank: Number,
  score_highest_rank_tick: Number,
  score_lowest_rank: Number,
  score_lowest_rank_tick: Number,
  points_highest_rank: Number,
  points_highest_rank_tick: Number,
  points_lowest_rank: Number,
  points_lowest_rank_tick: Number,
  size_avg_highest_rank: Number,
  size_avg_highest_rank_tick: Number,
  size_avg_lowest_rank: Number,
  size_avg_lowest_rank_tick: Number,
  score_avg_highest_rank: Number,
  score_avg_highest_rank_tick: Number,
  score_avg_lowest_rank: Number,
  score_avg_lowest_rank_tick: Number,
  points_avg_highest_rank: Number,
  points_avg_highest_rank_tick: Number,
  points_avg_lowest_rank: Number,
  points_avg_lowest_rank_tick: Number,
*/
});

module.exports = Mordor.model('AllianceHistory', AllianceHistorySchema, 'AllianceHistories');

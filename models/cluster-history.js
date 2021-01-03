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
 **/
const Mordor = require('../mordor');

let clusterHistorySchema = Mordor.Schema({
  tick: Number,
  hour: Number,
  timestamp: Date,
  x: Number,
  active: Boolean,
  age: Number,
  size: Number,
  score: Number,
  value: Number,
  xp: Number,
  members: Number,
  ratio: Number,
  size_rank: Number,
  score_rank: Number,
  value_rank: Number,
  xp_rank: Number,
  size_growth: Number,
  score_growth: Number,
  value_growth: Number,
  xp_growth: Number,
  member_growth: Number,
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
});

module.exports = Mordor.model('ClusterHistory', clusterHistorySchema, 'ClusterHistories');


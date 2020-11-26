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
const Mordor = require('../db.js');

let allianceDumpSchema = Mordor.Schema({
  alliance_id: { type: Mordor.Schema.Types.ObjectId, ref: "Alliance" },
  name: { type: String, required: true },
  size: { type: Number },
  members: { type: Number },
  score: { type: Number },
  points: { type: Number },
  score_rank: { type: Number },
  size_avg: { type: Number },
  score_avg: { type: Number },
  points_avg: { type: Number }
});

module.exports = Mordor.model('AllianceDump', allianceDumpSchema, 'AllianceDumps');


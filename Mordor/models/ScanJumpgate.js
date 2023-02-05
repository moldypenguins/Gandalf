'use strict';
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
 * @name Scan.js
 * @version 2023/02/04
 * @summary Mongoose Model
 **/

import mongoose from "mongoose";


let jumpgateProbeSchema = mongoose.Schema({
  _id:        {type:mongoose.Schema.Types.ObjectId, required:true},
  scan_id: {type: String, index: true},
  owner_id: Number,
  target_id: Number,
  fleet_size: Number,
  fleet_name: String,
  launch_tick: Number,
  landing_tick: Number,
  mission: String,
  in_cluster: Boolean,
  in_galaxy: Boolean
});

export default mongoose.model('JumpgateProbe', jumpgateProbeSchema, 'JumpgateProbes');

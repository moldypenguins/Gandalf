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
 * @name AllianceDump.js
 * @version 2021/05/30
 * @summary Mongoose Model
 **/
'use strict';

const Mordor = require('../Mordor');

let AllianceDumpSchema = new Mordor.Schema({
  _id:        {type:Mordor.Schema.Types.ObjectId, required:true, default:Mordor.Types.ObjectId()},
  name:       {type:String, required:true, trim:true},
  size:       {type:Number},
  members:    {type:Number},
  score:      {type:Number},
  points:     {type:Number},
  score_rank: {type:Number},
  size_avg:   {type:Number},
  score_avg:  {type:Number},
  points_avg: {type:Number},
});

module.exports = Mordor.model('AllianceDump', AllianceDumpSchema, 'AllianceDumps');

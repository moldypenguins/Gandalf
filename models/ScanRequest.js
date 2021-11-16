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
 * @name Member.js
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
'use strict';

const Mordor = require('../Mordor');

let scanRequestSchema = Mordor.Schema({
  _id:          {type:Mordor.Schema.Types.ObjectId, required:true},
  request_id:   {type:String, unique:true, required:true},
  x:            {type:Number, required:true},
  y:            {type:Number, required:true},
  z:            {type:Number, required:true},
  requester_id: {type:Number, required:true},
  planet_id:    {type:String, required:true},
  scantype:     {type:Number, required:true},
  dists:        {type:Number},
  scan_id:      {type:Number},
  active:       {type:Boolean},
  tick:         {type:Number},
});

module.exports = Mordor.model('ScanRequest', scanRequestSchema, 'ScanRequests');

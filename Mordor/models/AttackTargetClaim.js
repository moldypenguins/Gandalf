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
 * @name AttackTargetClaim.js
 * @version 2021/05/22
 * @summary Mongoose Model
 **/
'use strict';

import mongoose from 'mongoose';

let AttackTargetClaimSchema = new mongoose.Schema({
  _id:    {type:mongoose.Schema.Types.ObjectId, required:true},
  member: {type:mongoose.Schema.Types.ObjectId, ref:'Member', autopopulate: true},
  attack: {type:mongoose.Schema.Types.ObjectId, ref:'Attack'},
  planet: {type:mongoose.Schema.Types.ObjectId, ref:'Planet', autopopulate: true},
  wave:   {type:Number},
});

AttackTargetClaimSchema.index({attack_id:1, planet_id:1, wave:1}, {unique:true});

AttackTargetClaimSchema.plugin(require('mongoose-autopopulate'));

export default mongoose.model('AttackTargetClaim', AttackTargetClaimSchema, 'AttackTargetClaims');


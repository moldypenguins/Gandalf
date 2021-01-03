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
const Mordor = require('../Mordor');

let memberSchema = Mordor.Schema({
  id:          {type:Number, unique:true, required:true},
  username:    {type:String},
  first_name:  {type:String},
  last_name:   {type:String},
  photo_url:   {type:String},
  panick:      {type:String, index:true},
  email:       {type:String},
  phone:       {type:String},
  access:      {type:Number, default: 0},
  roles:       {type:Number, default: 0},
  sponsor:     {type:String},
  planet_id:   {type:String},
  last_access: {type:Date},
  site_theme:  {type:String, default:'default'},
  site_navigation: {type:String, default:'text'},
  timezone:    {type:String}
});

module.exports = Mordor.model('Member', memberSchema, 'Members');

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

let themeSchema = Mordor.Schema({
  name: {type:String, unique:true, required:true},
  key: {type:String, required:true, default:function() { return this.name.toLowerCase().replace(/\s/g,'_'); }},
  navbar: {type:String, required:true, default:'light'},
  active: {type:Boolean, default:true}
});

module.exports = Mordor.model('Theme', themeSchema, 'Themes');

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
 * @name Mordor.js
 * @version 2021/06/07
 * @summary Database
 **/
'use strict';

const CFG = require('./Config');
const Mordor = require("mongoose");

Mordor.set('useNewUrlParser', true);
Mordor.set('useFindAndModify', false);
Mordor.set('useCreateIndex', true);
Mordor.set('useUnifiedTopology', true);
Mordor.connect(CFG.db.uri + '/' + CFG.db.name).catch(err => console.log(err.reason));
Mordor.connection.on("error", () => {
  console.log("Error: database connection failed.");
});
Mordor.connection.once("connected", () => {
  console.log("Evil is stirring in Mordor.");
});


module.exports = Mordor;

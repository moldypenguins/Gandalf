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
 * @name MiddleEarth.config.js
 * @version 2022/11/11
 * @summary pm2 config
 **/
'use strict';

const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
  apps : [
    {
      namespace: "MiddleEarth",
      name: "Bilbo",
      cwd: "./Bilbo",
      script: "./bilbo.js",
      args: `-s ${dayjs().tz().format('YYYY-MM-DD H:mm z')}`,
      instance_var: 'INSTANCE_ID',
      watch: true,
      time: true,
      autorestart: false
    },
    {
      namespace: "MiddleEarth",
      name: "Frodo",
      cwd: "./Frodo",
      script: "./frodo.js",
      args: "-f -o",
      instance_var: 'INSTANCE_ID',
      watch: true,
      time: true,
      wait_ready: true
    },
    {
      namespace: "MiddleEarth",
      name   : "Gandalf",
      cwd: "./Gandalf",
      script : "./gandalf.js",
      instance_var: 'INSTANCE_ID',
      watch: true,
      time: true,
      wait_ready: true
    },
    /*
    {
      namespace: "MiddleEarth",
      name   : "Sauron",
      cwd: "./Sauron",
      script : "./sauron.js",
      instance_var: 'INSTANCE_ID',
      watch: true,
      time: true,
      wait_ready: true
    },
    */
  ],
  deploy : {
    production : {
      "user" : "ubuntu",
      "host" : ["127.0.0.1"],
      "ref"  : "origin/master",
      "repo" : "git@github.com:moldypenguins/Gandalf.git",
      "path" : "/home/ubuntu/MiddleEarth",
      "post-deploy" : "npm install"
    }
  }
};

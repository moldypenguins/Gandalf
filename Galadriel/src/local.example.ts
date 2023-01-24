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
 * @name local.example.ts
 * @version 2023/01/20
 * @summary local configuration file
 **/

import Config from "./Config";

const configLocal: Config = {
  admin: {
    pa_nick: '',
    discord_id: '',
    telegram_id: ''
  },
  alliance: {
    name: ''
  },
  discord: {
    token: '',
    client_id: '',
    guild_id: '',
    commands: ['addmember', 'bonus', 'links', 'launch', 'tick', 'ship']
  },
  telegram: {
    token: '',
    username: '',
    group_id: '',
    commands: ['addmember', 'bonus', 'links', 'launch', 'tick', 'ship']
  },
  twilio: {
    sid: "",
    secret: "",
    number: ''
  },
  db: {
    url: '127.0.0.1:27017',
    name: 'Mordor',
    user: '',
    pass: ''
  },
  web: {
    env: 'dev',
    port: 8080,
    url: '',
    session: '',
    default_theme: 'affleck'
  }
};

export default configLocal

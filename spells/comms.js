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
 * @name comms.js
 * @version 2021/06/07
 * @summary Gandalf Spells
 **/
'use strict';

const CFG = require('../Config');
const PA = require('../PA');
const AXS = require('../Access');
const Comms = require('../Comms');

const Members = require('../models/Member');

const numeral = require('numeral');
const moment = require('moment');
const he = require('he');
const util = require("util");

let Comms_call_usage = he.encode('!call <user>');
let Comms_call_desc = 'Calls a user via twilio';
let Comms_call = (args, ctx) => {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(args) || args.length < 1) { reject(Comms_call_usage); }
        let username = args[0];
        //console.log(username);

        let mem = null;
        if(args[0].startsWith('@') && ctx.message.entities.some(e => e.type === 'mention')) {
            mem = await Members.findOne({username: username.replace(/^@/, '')});
        } else {
            let members = await Members.find();
            mem = members.find(m => (m.panick != null && m.panick.toLowerCase().startsWith(username.toLowerCase())) || (m.first_name != null && m.first_name.toLowerCase().startsWith(username.toLowerCase())));
        }
        //console.log('MEMBER: ' + util.inspect(mem, false, null, true));

        if (mem == null) {
            reject(`Sorry I don't know who ${args[0]} is`);
        } else {
            Comms.callMember(mem).then(() => {
                resolve(`Successfully called <a href="tg://user?id=${mem.id}">${mem.panick != null ? mem.panick : mem.username}</a>`);
            }, (error) => {
                reject(error);
            });
        }
    });
};

let Comms_contact_usage = he.encode('!contact <user>');
let Comms_contact_desc = 'Displays a users TG username';
let Comms_contact = (args, ctx) => {
    return new Promise(function (resolve, reject) {
        if (!Array.isArray(args) || args.length < 1) { reject(Comms_contact_usage); }
        Members.find().then((members) => {
            var username = args[0].toLowerCase();
            var member = members.find(m => (m.panick != null && m.panick.toLowerCase().startsWith(username)) || (m.first_name != null && m.first_name.toLowerCase().startsWith(username)));
            if (member == null) {
                reject(`Sorry I don't know who ${args[0]} is`);
                return;
            }
            resolve(`Contact: <a href="tg://user?id=${member.id}">${member.panick != null ? member.panick : member.username}</a>`);
        });
    });
};

module.exports = {
    "call": { usage: Comms_call_usage, description: Comms_call_desc, access: AXS.botMemberRequired, cast: Comms_call, include_ctx: true },
    "contact": { usage: Comms_contact_usage, description: Comms_contact_desc, access: AXS.botMemberRequired, cast: Comms_contact, include_ctx: true }
};

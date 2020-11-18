const config = require('../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const comms = require('../comms');
const Members = require('../models/member');

let Comms_call_usage = entities.encode('!call <user>');
let Comms_call_desc = 'Calls a user via twilio';
let Comms_call = (args) => {
    return new Promise(function (resolve, reject) {
        if (!Array.isArray(args) || args.length < 1) { reject(Comms_call_usage); }
        Members.find().then((members) => {
            var username = args[0].toLowerCase();
            console.log(username);
            var member = members.find(m => (m.panick != null && m.panick.toLowerCase().startsWith(username)) || (m.first_name != null && m.first_name.toLowerCase().startsWith(username)));
            //console.log(member);
            if (member == null) {
                reject(`Sorry I don't know who ${args[0]} is`);
                return;
            } else if (member.phone === null || member.phone == '') {
                reject(`${member.panick} does not have a phone number set!`);
                return;            
            }
            comms.callMember(member.id).then(() => {
                resolve(`Successfully called <a href="tg://user?id=${member.id}">${member.panick != null ? member.panick : member.username}</a>`);
            }, (error) => {
                reject(error);
            });
        });
    });
};

let Comms_contact_usage = entities.encode('!contact <user>');
let Comms_contact_desc = 'Displays a users TG username';
let Comms_contact = (args) => {
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
    "call": { usage: Comms_call_usage, description: Comms_call_desc, access: access.botMemberRequired, cast: Comms_call },
    "contact": { usage: Comms_contact_usage, description: Comms_contact_desc, access: access.botMemberRequired, cast: Comms_contact }
};

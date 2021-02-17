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
const config = require('./config');
const util = require('util');
const client = require('twilio')(config.twilio.sid, config.twilio.secret);

let callMember = (member) => {
  return new Promise((resolve, reject) => {
    //console.log('Member: ' + util.inspect(member,true,null,true));
    if(member.phone === undefined || member.phone === null || member.phone.length <= 0) {
      reject(`${member.username} does not have a phone number set`);
    } else {
      let options = {
        to: '+' + member.phone,
        from: config.twilio.number,
        url: config.twilio.url,
      };
      console.log('Calling ' + member.panick);
      client.calls.create(options).then((call) => {
          console.log(util.inspect(call, false, null, true));
          //TODO: send message saying calling, get message.id
          //TODO: insert into BotCalls - save call.id and message.id
          setTimeout(async () => {
              await call.update({status:'completed'});
          }, config.twilio.ring_timeout * 1000);
          resolve();
      });
    }
  });
}

module.exports = {
  "callMember": callMember,
};

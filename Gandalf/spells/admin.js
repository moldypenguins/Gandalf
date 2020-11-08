const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const util = require('util');

var Admin_leavechat_usage = entities.encode('!leavechat <chat id>');
var Admin_leavechat_desc = 'Leaves a group, supergroup, or channel.';
var Admin_leavechat = (args, bot) => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Admin_leavechat_usage); }
    bot.telegram.leaveChat(args[0]).then((result) => {
      console.log('RESULT:' + util.inspect(result, false, null, true));
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
    
  });
}


module.exports = {
  "leavechat": { usage: Admin_leavechat_usage, description: Admin_leavechat_desc, access: access.adminRequired, cast: Admin_leavechat, include_telegraf: true },
};

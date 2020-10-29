const config = require('../../config');
const numeral = require('numeral');
const moment = require('moment');
const qs = require("querystring");
const access = require('../access');

var Admin_leavechat_usage = qs.encode('!leavechat <chat id>');
var Admin_leavechat_desc = 'Leaves a group, supergroup, or channel.';
var Admin_leavechat = (args, bot) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(args) || args.length < 1) { reject(Admin_leavechat_usage); }
    bot.telegram.leaveChat(args[0]).then((result) => {
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
    
  });
}

module.exports = {
  "leavechat": { usage: Admin_leavechat_usage, description: Admin_leavechat_desc, access: access.adminRequired, cast: Admin_leavechat, include_telegraf: true },
};

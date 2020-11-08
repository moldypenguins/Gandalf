const config = require('../../config');
const access = require('../access');
const numeral = require('numeral');
const moment = require('moment');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

//const util = require('util');

var Admin_leavechat_usage = entities.encode('!leavechat [chat id]');
var Admin_leavechat_desc = 'Leaves a group, supergroup, or channel.';
var Admin_leavechat = (args, ctx) => {
  return new Promise(async (resolve, reject) => {
    var chatid;
    if (args == null || args.length == 0) {
      chatid = ctx.chat.id;
    } else if (args.length > 0) {
      chatid = args[0];
    }
    //console.log('CHATID:' + util.inspect(chatid, false, null, true));
    if(!chatid) {reject(Admin_leavechat_usage);}
    ctx.telegram.leaveChat(chatid).then((result) => {
      //console.log('RESULT:' + util.inspect(result, false, null, true));
      resolve(`left the group ${chatid}`);
    }).catch((error) => {
      reject(`unable to leave the group ${chatid}`)
    });
    
  });
}


module.exports = {
  "leavechat": { usage: Admin_leavechat_usage, description: Admin_leavechat_desc, access: access.adminRequired, cast: Admin_leavechat, include_ctx: true, reply_private: true },
};

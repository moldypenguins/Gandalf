var config = require('config');
var db = require('db');
var Member = require('models/member');
var Applicant = require('models/applicant');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var util = require('util');


function checkSignature({ hash, ...data }) {
  const secret = crypto.createHash('sha256')
    .update(config.bot.token)
    .digest();
  const checkString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  return hmac === hash;
}


router.get("/", async (req, res, next) => {
  if(checkSignature(req.query)) {
    //successful login
    var params = JSON.parse(JSON.stringify(req.query));
    var member = await Member.findOne({id: params.id});
    if(member) {
      console.log('Is Member');
      await Member.updateOne({id: params.id}, {username: params.username, first_name: params.first_name, last_name: params.last_name, photo_url: params.photo_url});
      req.session.member = member;
      res.redirect("/");
    } else {
      var applicant = await Applicant.findOne({id: params.id});
      if(applicant) {
        console.log('Is Applicant');
        req.session.applicant = applicant;
      } else {
        console.log('Is Visitor');
        req.session.visitor = params;
      }
      res.redirect("/register");
    }
  } else {
    //failed login
    next(401);
  }
  //res.redirect("/");
});


module.exports = router;


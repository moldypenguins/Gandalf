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
 * @name Sauron.js
 * @version 2020/11/19
 * @summary Website
 **/
const config = require('./config');
const db = require('./db');
const Tick = require('./models/tick');
const Member = require('./models/member');
const Theme = require('./models/theme');
const Planet = require('./models/planet');
const Ship = require('./models/ship');
const Scan = require('./models/scan');
const UnitScan = require('./models/scan-unit');
const DevelopmentScan = require('./models/scan-development');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const session = require("express-session");
const url = require('url');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const http = require('http');
const https = require('https');
let options = {
  key: fs.readFileSync('ssl/private.key'),
  cert: fs.readFileSync('ssl/certificate.crt')
};
let corsOptions = {
  "origin": /game\.planetarion\.com$/,
  "methods": ["POST", "GET", "OPTIONS"],
  "allowedHeaders": ['Content-Type', 'Authorization'],
  "credentials": true,
  "optionsSuccessStatus": 204
};

const uptimeRoute = require('./routes/uptime');
const authorizeRoute = require('./routes/authorize');
const logoutRoute = require('./routes/logout');
const registerRoute = require('./routes/register');
const dashboardRoute = require('./routes/dashboard');
const battlegroupsRoute = require('./routes/battlegroups');
const covertoperationsRoute = require('./routes/covertoperations');
const profileRoute = require('./routes/profile');
const strategyRoute = require('./routes/strategy');
const membersRoute = require('./routes/members');
const scansRoute = require('./routes/scans');
const parseRoute = require('./routes/parse');
const attacksRoute = require('./routes/attacks');
const universeRoute = require('./routes/universe');

const util = require('util');

let loginRequired = async (req, res, next) => {
  //console.log('LOCALS: ' + util.inspect(res.locals, false, null, true));
  //console.log('SESSION: ' + util.inspect(req.session, false, null, true));
  if (typeof (res.locals.member) == 'undefined') {
    //req var to forward
    //console.log('REQ URL: ' + req.originalUrl);
    if (req.originalUrl !== '/') {
      req.session.req_url = url.format({
        protocol: req.protocol, host: req.get('host'), pathname: req.originalUrl
      });
    }
    return res.status(401).render('unauthorized', {site_title: config.alliance.name, page_title: config.alliance.name});
  } else {
    let updated = await Member.updateOne({id: res.locals.member.id}, {last_access: Date.now()});
    if (req.session.req_url !== undefined) {
      let req_url = req.session.req_url;
      req.session.req_url = undefined;
      res.redirect(req_url);
    } else {
      next();
    }
  }
}


let app = express();
db.connection.once("open", () => {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: config.web.session, resave: true, saveUninitialized: false, cookie: {sameSite: 'none', secure: true}
  }));
  //redirect to https
  app.use((req, res, next) => {
    if (req.headers.host.slice(0, 4) === 'www.') {
      res.redirect(301, "https://" + req.headers.host.slice(4) + req.url);
    } else {
      if (req.secure) {
        next();
      } else {
        res.redirect('https://' + req.headers.host + req.url);
      }
    }
  });
  //add session objects to locals
  app.use(async (req, res, next) => {
    res.locals.site_theme = await Theme.findOne({key: config.web.default_theme.toLowerCase()});
    res.locals.site_url = config.web.uri;
    res.locals.alliance_name = config.alliance.name;
    res.locals.bot_name = config.bot.username;
    res.locals.default_profile_pic = config.web.default_profile_pic;

    res.locals.tick = await Tick.findOne().sort({id: -1});

    res.locals.member = req.session.member;
    res.locals.applicant = req.session.applicant;
    res.locals.visitor = req.session.visitor;

    //console.log('MEMBER: ' + util.inspect(req.session.member, false, null, true));
    if (typeof (req.session) !== 'undefined' && typeof (req.session.member) !== 'undefined' && req.session.member != null) {
      if (req.session.member.site_theme) {
        res.locals.site_theme = await Theme.findOne({key: req.session.member.site_theme.toLowerCase()});
      }
      res.locals.member.isADM = req.session.member.access === 5;
      res.locals.member.isHC = req.session.member.access >= 3 && (req.session.member.roles & 16) !== 0;
      res.locals.member.isDC = req.session.member.access >= 3 && (req.session.member.roles & 8) !== 0;
      res.locals.member.isBC = req.session.member.access >= 3 && (req.session.member.roles & 4) !== 0;
      res.locals.member.isCMDR = req.session.member.access >= 3;
      res.locals.member.isSCNR = req.session.member.access >= 1 && (req.session.member.roles & 2) !== 0;
      res.locals.member.isMEM = req.session.member.access >= 1;
      res.locals.member.planet = await Planet.findOne({id: res.locals.member.planet_id});
      res.locals.member.scans = {};
      res.locals.member.scans.d = await Scan.findOne({planet_id: res.locals.member.planet_id, scantype: 3}).sort({tick: -1, _id: -1});
      if (typeof (res.locals.member.scans.d) != 'undefined' && res.locals.member.scans.d != null) {
        res.locals.member.scans.d.scan = await DevelopmentScan.findOne({scan_id: res.locals.member.scans.d.id});
      }
      res.locals.member.scans.a = await Scan.findOne({planet_id: res.locals.member.planet_id, scantype: 8}).sort({tick: -1, _id: -1});
      if (typeof (res.locals.member.scans.a) != 'undefined' && res.locals.member.scans.a != null) {
        res.locals.member.scans.a.scan = await UnitScan.find({scan_id: res.locals.member.scans.a.id});
        for (let j = 0; j < res.locals.member.scans.a.scan.length; j++) {
          res.locals.member.scans.a.scan[j].ship = await Ship.findOne({id: res.locals.member.scans.a.scan[j].ship_id});
        }
      }
    }

    next();
  });
  //non-csrf routes
  app.use('/uptime', uptimeRoute);
  app.use('/parse', cors(corsOptions), parseRoute);
  app.use('/reject', cors(corsOptions), parseRoute);

  //app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  //app.use(csrf({ cookie: true }));

  //csrf routes
  app.use('/auth', authorizeRoute);
  app.use('/reg', registerRoute);
  app.use('/', loginRequired, dashboardRoute);
  app.use('/logout', loginRequired, logoutRoute);
  app.use('/profile', loginRequired, profileRoute);
  app.use('/bgs', loginRequired, battlegroupsRoute);
  app.use('/covops', loginRequired, covertoperationsRoute);
  app.use('/uni', loginRequired, universeRoute);
  app.use('/strat', loginRequired, strategyRoute);
  app.use('/mem', loginRequired, membersRoute);
  app.use('/scans', loginRequired, cors(corsOptions), scansRoute);
  app.use('/att', loginRequired, attacksRoute);
  //errors
  app.use(async(req, res, next) => {
    next(createError(404));
  });
  app.use(async(err, req, res, next) => {
    //csrf
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403);
      res.send('form tampered with');
    } else {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(err.status || 500);
      let theme = await Theme.findOne({key: config.web.default_theme.toLowerCase()});
      res.render('error', {alliance_name: config.alliance.name, site_title: config.alliance.name, page_title: 'Error', site_theme: theme});
    }
  });
  //start listening
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  console.log('Sauron has returned.');
});
module.exports = app;



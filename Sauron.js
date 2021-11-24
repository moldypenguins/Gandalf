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
 * @version 2021/07/08
 * @summary Website
 **/
'use strict';

const CFG = require('./Config');
const PA = require('./PA');
const FNCS = require('./Functions');
const Mordor = require('./Mordor');

const Tick = require('./models/Tick');
const Attack = require('./models/Attack');
const Member = require('./models/Member');
const TelegramUser = require('./models/TelegramUser');
const Planet = require('./models/Planet');
const Ship = require('./models/Ship');
const Scan = require('./models/Scan');
const UnitScan = require('./models/ScanUnit');
const DevelopmentScan = require('./models/ScanDevelopment');

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
const helpRoute = require('./routes/help');
const scansRoute = require('./routes/scans');
const parseRoute = require('./routes/parse');
const attacksRoute = require('./routes/attacks');
const universeRoute = require('./routes/universe');
const claimsRoute = require('./routes/claims');

const util = require('util');

let loginRequired = async (req, res, next) => {
  //console.log('LOCALS: ' + util.inspect(res.locals, false, null, true));
  //console.log('SESSION: ' + util.inspect(req.session, false, null, true));
  if(typeof(req.session.member) == 'undefined') {
    //req var to forward
    //console.log('REQ URL: ' + req.originalUrl);
    if (req.originalUrl !== '/') {
      req.session.req_url = url.format({
        protocol: req.protocol, host: req.get('host'), pathname: req.originalUrl
      });
    }
    return res.status(401).render('unauthorized', {site_title: CFG.alliance.name, page_title: CFG.alliance.name});
  } else {
    await Member.updateOne({telegram_user: res.locals.member.telegram_user}, {last_access: Date.now()});
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
Mordor.connection.once("open", () => {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: CFG.web.session, resave: true, saveUninitialized: false, cookie: {sameSite: 'none', secure: true}
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
    res.locals.site_theme_name = CFG.web.default_theme.toLowerCase() ? CFG.web.default_theme.toLowerCase() : 'affleck';
    res.locals.site_theme = CFG.web.themes[CFG.web.default_theme.toLowerCase()] ? CFG.web.themes[CFG.web.default_theme.toLowerCase()] : CFG.web.themes['affleck'];

    res.locals.site_url = CFG.web.uri;
    res.locals.alliance_name = CFG.alliance.name;
    res.locals.bot_name = CFG.bot.username;
    res.locals.default_profile_pic = CFG.web.default_profile_pic;

    res.locals.tick = await Tick.findOne().sort({tick: -1});

    res.locals.member = req.session.member;
    res.locals.applicant = req.session.applicant;
    res.locals.visitor = req.session.visitor;

    //console.log('MEMBER: ' + util.inspect(req.session.member, false, null, true));
    if(req.session?.member !== undefined && req.session.member != null) {
      if(req.session.member.site_theme !== undefined && req.session.member.site_theme !== 'default' && CFG.web.themes[req.session.member.site_theme]) {
        res.locals.site_theme_name = req.session.member.site_theme;
        res.locals.site_theme = CFG.web.themes[req.session.member.site_theme];
      }
      res.locals.member.telegram_user.telegram_name = FNCS.getTelegramName(res.locals.member.telegram_user);
      res.locals.member.isADM = req.session.member.access === 5;
      res.locals.member.isHC = req.session.member.access >= 3 && (req.session.member.roles & 16) !== 0;
      res.locals.member.isDC = req.session.member.access >= 3 && (req.session.member.roles & 8) !== 0;
      res.locals.member.isBC = req.session.member.access >= 3 && (req.session.member.roles & 4) !== 0;
      res.locals.member.isCMDR = req.session.member.access >= 3;
      res.locals.member.isSCNR = req.session.member.access >= 1 && (req.session.member.roles & 2) !== 0;
      res.locals.member.isMEM = req.session.member.access >= 1;
      res.locals.member.planet = await Planet.findById(req.session.member.planet);
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
      let w = `this.landtick + (this.waves - 1) + ${CFG.alliance.attack.after_land_ticks} > ${res.locals.tick.tick} && this.releasetick <= ${res.locals.tick.tick}`;// + (res.locals.member.isCMDR ? '' : ` && this.releasetick <= ${res.locals.tick.tick}`);
      // + (res.locals.tick.tick - CFG.alliance.attack.after_land_ticks).toString() + res.locals.member.isCMDR ? '' : ' && this.releasetick <= ' + res.locals.tick.tick.toString();
      console.log('WHERE: ' + util.inspect(w, false, null, true));
      res.locals.active_attacks = await Attack.find({$where:w}).sort({number: 1});
    }

    next();
  });
  //non-csrf routes
  app.use('/uptime', uptimeRoute);

  //#TODO: check these routes for efficiency and security
  app.use('/parse', cors(corsOptions), parseRoute);
  app.use('/reject', cors(corsOptions), parseRoute);
  app.use('/claims', cors(corsOptions), claimsRoute);

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
  app.use('/help', loginRequired, helpRoute);
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
      res.render('error', {alliance_name: CFG.alliance.name, site_title: CFG.alliance.name, page_title: 'Error', site_theme: CFG.web.themes['affleck'], bot_name: CFG.bot.username});
    }
  });
  //start listening
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  console.log('Sauron has returned.');
});
module.exports = app;



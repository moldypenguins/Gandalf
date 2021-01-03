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
const config = require('../config');
const express = require('express');
let router = express.Router();
const access = require('../access');
const fs = require('fs');


router.get('/', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'strategy' });
  });
});


router.get('/ship', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_ship.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'ship' });
  });
});

router.get('/tickplan', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'tickplan' });
  });
});

router.get('/tickplan/ter', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan_ter.html', fs.constants.F_OK, (err) => {
    res.render('tickplan', { content_exists: err ? false : true, race: 'ter' });
  });
});

router.get('/tickplan/cat', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan_cat.html', fs.constants.F_OK, (err) => {
    res.render('tickplan', { content_exists: err ? false : true, race: 'cat' });
  });
});

router.get('/tickplan/xan', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan_xan.html', fs.constants.F_OK, (err) => {
    res.render('tickplan', { content_exists: err ? false : true, race: 'xan' });
  });
});

router.get('/tickplan/zik', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan_zik.html', fs.constants.F_OK, (err) => {
    res.render('tickplan', { content_exists: err ? false : true, race: 'zik' });
  });
});

router.get('/tickplan/etd', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_tickplan_etd.html', fs.constants.F_OK, (err) => {
    res.render('tickplan', { content_exists: err ? false : true, race: 'etd' });
  });
});


router.get('/forting', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_forting.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'forting' });
  });
});


router.get('/startup', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_startup.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'startup' });
  });
});


router.get('/quests', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_quests.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'quests' });
  });
});


router.get('/scans', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_scans.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'scans' });
  });
});


router.get('/attack', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_attack.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'attack' });
  });
});


router.get('/defence', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_defence.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'defence' });
  });
});


router.get('/complaints', access.webMemberRequired, function(req, res, next) {
  fs.access('views/content/strat_complaints.html', fs.constants.F_OK, (err) => {
    res.render('strategy', { content_exists: err ? false : true, strategy: 'complaints' });
  });
});


module.exports = router;


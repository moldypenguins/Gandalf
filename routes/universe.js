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
const Member = require('../models/member');
const Applicant = require('../models/applicant');
const Alliance = require('../models/alliance');
const Cluster = require('../models/cluster');
const Galaxy = require('../models/galaxy');
const Planet = require('../models/planet');
const createError = require('http-errors');
const express = require('express');
let router = express.Router();
const util = require('util');

router.get('/', async (req, res, next) => {
  let allys = await Alliance.find().sort({score: -1}).limit(5);

  let plnts = await Planet.find().sort({score: -1}).limit(100);

  res.render('universe', { page: 'u', alliances: allys, planets: plnts });
});


router.get('/a', async (req, res, next) => {
  let allys = await Alliance.find().sort({score: -1});
  res.render('universe', { page: 'a', alliances: allys });
});
router.get('/a/:alliance', async (req, res, next) => {
  Alliance.findOne({alias: req.params.alliance}).then((ally) => {
    if(ally) {
      res.render('universe', { page: 'a', alliance: ally });
    } else {
      next(createError(400));
    }
  });
});


router.get('/c', function(req, res, next) {
  Cluster.find().then((clusts) => {
    if(clusts) {
      res.render('universe', { page: 'c', clusters: clusts });
    } else {
      next(createError(400));
    }
  });
});
router.get('/c/:x', function(req, res, next) {
  Cluster.findOne({x: req.params.x}).then((clust) => {
    if(clust) {
      res.render('universe', { page: 'c', cluster: clust });
    } else {
      next(createError(400));
    }
  });
});


router.get('/g', function(req, res, next) {
  Galaxy.find().then((gals) => {
    if(gals) {
      res.render('universe', { page: 'g', galaxies: gals });
    } else {
      next(createError(400));
    }
  });
});
router.get('/g/:x/:y', function(req, res, next) {
  Galaxy.findOne({x: req.params.x, y: req.params.y}).then((gal) => {
    if(gal) {
      res.render('universe', { page: 'g', galaxy: gal });
    } else {
      next(createError(400));
    }
  });
});


router.get('/p', async (req, res, next) => {
  let plnts = await Planet.find().sort({score: -1});
  res.render('universe', { page: 'p', planets: plnts });
});
router.get('/p/:x/:y/:z', function(req, res, next) {
  Planet.findOne({x: req.params.x, y: req.params.y, z: req.params.z}).then((plnt) => {
    if(plnt) {
      res.render('universe', { page: 'p', planet: plnt });
    } else {
      next(createError(400));
    }
  });
});


module.exports = router;


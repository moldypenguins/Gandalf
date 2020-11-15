const config = require('../config');
const db = require('../db');
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

router.get('/', function(req, res, next) {
  res.render('universe', { page: 'u' });
});


router.get('/a', function(req, res, next) {
  Alliance.find().then((allys) => {
    if(allys) {
      res.render('universe', { page: 'a', alliances: allys });
    } else {
      next(createError(400));
    }
  });
});
router.get('/a/:alliance', function(req, res, next) {
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


router.get('/p', function(req, res, next) {
  Planet.find().then((plnts) => {
    if(plnts) {
      res.render('universe', { page: 'p', planets: plnts });
    } else {
      next(createError(400));
    }
  });
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


const config = require('../config');
const db = require('../db');
const Member = require('../models/member');
const Applicant = require('../models/applicant');
const Planet = require('../models/planet');
const express = require('express');
let router = express.Router();
const util = require('util');
const fs = require('fs');
const csrf = require('csurf')

const csrfProtection = csrf({ cookie: true });

//router.get('/', csrfProtection, async (req, res, next) => {
router.get('/', async (req, res, next) => {
  fs.access('views/content/dashboard.html', fs.constants.F_OK, (err) => {
    //res.render('dashboard', { csrfToken: req.csrfToken(), content_exists: err ? false : true });
    res.render('dashboard', { content_exists: !err });
  });
});



module.exports = router;


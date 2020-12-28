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


router.get('/', async (req, res, next) => {
  res.render('covops', { });
});


module.exports = router;


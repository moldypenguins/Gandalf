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
const Attack = require('../models/attack');
const Planet = require('../models/planet');
const AttackTargetClaim = require('../models/attack-target-claim');
const express = require('express');
let router = express.Router();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 5, // start blocking after 5 requests
  message: "Too many refreshes, please try again after 5 minutes",
  keyGenerator: (req) => {
    return req.ip + '-' + req.params.hash;
  }
});

router.get('/', async (req, res) => {
  let member = res.locals.member;
  let lastatt = await Attack.findOne().sort({id: -1});
  let claims = await AttackTargetClaim.find({attack_id:lastatt.id, member_id: member.id});
  let normalized_claims = [];
  for (let claim of claims) {
    let planet = await Planet.findOne({id: claim.planet_id});
    normalized_claims.push({
      coords: `${planet.x}:${planet.y}:${planet.z}`,
      land_tick: claim.wave + lastatt.landtick,
    });
  }
  res.send({claims: normalized_claims, attack: lastatt});
});

module.exports = router;

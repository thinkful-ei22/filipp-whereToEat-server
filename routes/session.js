const express = require('express');
const mongoose = require('mongoose');

const NewSession = require('../models/new-session');

const router = express.Router();

//Creates a new session
router.post('/', (req, res, next) => {
  console.log('Create new session running');
  const { userLocation } = req.body;

  NewSession.create({userLocation: userLocation})
    .then(result => {
      console.log('RESULT', result);
      res.location(req.originalUrl).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;
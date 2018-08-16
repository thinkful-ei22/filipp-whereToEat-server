const express = require('express');
const mongoose = require('mongoose');

const Places = require('../models/places');

const router = express.Router();


//Gets all the places for the given sessionId and userId
router.get('/:sessionId/:userId', (req, res, next) => {
  const { sessionId, userId } = req.params;
  const currentSession = sessionId;
  const currentUser = userId;
  console.log('currentSession', currentSession);
  Places.find({'sessionId':`${currentSession}`, 'userId':`${currentUser}`})
    .then(results => {
      console.log('get all is running');
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//adds new place to the database using sessionId and userId
router.post('/', (req, res, next) => {
  console.log('REQ BODY', req.body);
  const { place, sessionId, userId } = req.body;

  const newPlace = { place, sessionId, userId };

  Places.create(newPlace)
    .then(result => {
      console.log('post is running');
      res.location(req.originalUrl).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

//deletes a place from the database
router.delete('/', (req, res, next) => {
  const { deleteId } = req.body;
  Places.findByIdAndRemove(deleteId)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
  
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');

const Places = require('../models/places');
const {API_KEY} = require('../config.js');
const fetch = require('node-fetch');

const router = express.Router();


//Gets the results for the current session id using the location
router.get('/:sessionId/:userLocation', (req, res, next) => {
  const { sessionId, userLocation } = req.params;

  Places.aggregate([{$match: {sessionId: sessionId}},{'$group' : {_id:'$place', count:{$sum:1}}}, {$sort:{'count':-1}}])
    .then(results => {
      console.log('get popular is running');
      if(results) {
        console.log('POPULAR RESULTS', results);
        if (results[1] && results[0].count === results[1].count) {
          const equalPopularityPlaces = results.filter(place => place.count === results[0].count);
          return(equalPopularityPlaces[Math.floor(Math.random()*equalPopularityPlaces.length)]);
        } else {
          return(results[0]);
        }
      } else {
        next();
      }
    })
    .then(results => {
      fetch(`https://api.yelp.com/v3/businesses/search?term=${results._id}&location=${userLocation}&limit=1`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      })
        .then(response => {
          if (response.ok) {
            return response.json();} 
          else {
            next();
          }
        })
        .then(response => {
          res.json(response);
        });
    })
    
    .catch(err => {
      next(err);
    });
});

module.exports = router;
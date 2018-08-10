require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Places = require('./models/places');
const NewSession = require('./models/new-session');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const {API_KEY} = require('./config.js');

const BASE_BUSINESSES_URL = 'https://api.yelp.com/v3/businesses/search?term=mcdonalds&city=Everett&state=WA&limit=1';


const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');



const app = express();

app.use(bodyParser.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/places/:sessionId/:userId', (req, res, next) => {
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

app.get('/api/results/:sessionId/:userLocation', (req, res, next) => {
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

app.post('/api/places', (req, res, next) => {
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

app.post('/api/session', (req, res, next) => {
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

app.delete('/api/places', (req, res, next) => {
  const { deleteId, sessionId } = req.body;
  Places.findByIdAndRemove(deleteId)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
  
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };

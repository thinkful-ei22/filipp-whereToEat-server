const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Places = require('./models/places');
const NewSession = require('./models/new-session');
const bodyParser = require('body-parser');


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

app.get('/api/places', (req, res, next) => {
  Places.find()
    .then(results => {
      console.log('get is running');
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

app.post('/api/places', (req, res, next) => {
  console.log('REQ BODY', req.body);
  const { place } = req.body;

  const newPlace = { place };

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

  NewSession.create({active: true})
    .then(result => {
      console.log('RESULT', result);
      res.location(`${req.originalUrl}`).status(201).json(result);
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

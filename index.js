const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { User, Contact, Visit, CareerForm } = require('./db');
const {addWwwToUrl} = require("./utils");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use the cors middleware with the appropriate options

const frontendURL = process.env.FRONT_END_URL 
const whitelist = [frontendURL, addWwwToUrl(frontendURL)]
console.log("setting cors to: "+ whitelist)
app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }, // Replace with the origin of your frontend
    credentials: true,
  })
);

// Import your API router from api.js
const apiRouter = require('./api');
app.use('/', apiRouter);  // Use the '/api' prefix for all API routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

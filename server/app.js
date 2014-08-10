/**
 * Main application file
 **/

'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var _ = require('lodash');
var async = require('async');
var express = require('express');
var moment = require('moment');
var mongoose = require('mongoose');
var config = require('./config/environment');
var request = require('request');
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

mongoose.connect(config.mongo.uri, config.mongo.options);

var s = {
  Subscriber : mongoose.model('Subscriber', new mongoose.Schema({
    yo: {
      type: String,
      unique: true
    },
    url: String,
    body: String,
    lastUpdated: Number
  })),
  getPage : function(url, cb) {
    request(url, cb);
  }
};

var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app, s);

var yo = (function() {
  var Yo = require('yo-api');
  return new Yo(process.env.YO_API_TOKEN);
})();

var updateSubscription = function(){
  s.Subscriber
    .findOne({}, null, {sort:{lastUpdated : 1}} ,function (err, doc) {
      console.log("yo : ", doc.yo, "lastUpdated : ", doc.lastUpdated);
      if(doc)
      {
        s.getPage(doc.url,
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              if(body != doc.body) {
                doc.body = body;
                console.log('Found new listings for user ' + doc.yo + '!');
                yo.yo(doc.yo, function() {
                  console.log("Yo'ed user " + doc.yo + '!');
                });
              }
              else
              {
                console.log('And the subscription continues...');
              }
            }
            else
            {
              console.log(error);
            }
          }
        );
        doc.lastUpdated = Date.now();
        doc.save(function(err) {
          if(!err) {
            console.log('OK');
          }
          else {
            console.log(err);
          }
        });
      }
    });
};

var interval = setInterval(updateSubscription, 61000);

server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

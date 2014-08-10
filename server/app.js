/**
 * Main application file
 **/

'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var _ = require('lodash');
var async = require('async');
var express = require('express');
var md5 = require('MD5');
var mongoose = require('mongoose');
var request = require('superagent');
var config = require('./config/environment');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

mongoose.connect(config.mongo.uri, config.mongo.options);

var Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  yo: {
    type: String,
    unique: true
  },
  url: String,
  hash: String,
  lastUpdated: Number
}));

var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

var yo = (function() {
  var Yo = require('yo-api');
  return new Yo('f75acaea-0da1-0995-f842-61ad42c50ae1');
})();

function checkUpdates(subscriber, cb) {
  request.get(yo.url).end(function(err, response) {
    var hash = md5(response.text);
    if (subscriber.hash !== hash) {
      subscriber.hash = hash;
      return cb(true);
    }
    cb(false);
  });
}

function onSubscriberUpdate(sub) {
  console.log('Sent yo to subscriber %s for Craigslist updates.', sub.yo);
  sub.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
}

function updateSubscriptions() {
  Subscriber.find({}).exec(function(err, docs) {
    async.detect(docs, checkUpdates, function(sub) {
      yo.yo(sub.yo, onSubscriberUpdate);
    });
  });
}

updateSubscriptions();
setInterval(updateSubscriptions, 60000);

server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});


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

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

mongoose.connect(config.mongo.uri, config.mongo.options);

var Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  yo: {
    type: String,
    unique: true
  },
  url: String,
  hash: String
}));

var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

var yo = (function() {
  var Yo = require('yo-api');
  return new Yo(process.env.YO_API_TOKEN);
})();

function checkUpdates(sub, cb) {
  request.get(sub.url).end(function(err, response) {
    if (err) {
      console.log(err);
      return cb();
    }
    var hash = md5(response.text);
    if (sub.hash !== hash) {
      sub.hash = hash;
      yo.yo_link(sub.yo, sub.url, function() {
        console.log('Sent yo to subscriber %s for Craigslist updates.', sub.yo);
        sub.save(function(err) {
          if (err) {
            console.log(err);
          }
          return cb();
        });
      });
    } else {
      cb();
    }
  });
}

function updateSubscriptions() {
  Subscriber.find({}).exec(function(err, docs) {
    if (err) {
      console.log(err);
      return;
    }
    async.eachSeries(docs, checkUpdates, function() {
      console.log('Done!');
    });
  });
}

updateSubscriptions();
setInterval(updateSubscriptions, 1800000);

server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

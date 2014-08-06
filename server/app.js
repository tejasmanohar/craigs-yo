/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var async = require('async');
var express = require('express');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('superagent');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  yo: {
    type: String,
    unique: true
  },
  following: [String],
  lastUpdate: Date
}));

// Setup server
var app = express();
var server = require('http').createServer(app);

require('./config/express')(app);
require('./routes')(app);

// Yo stuff
var yo = (function() {
  var Yo = require('yo-api');
  return new Yo(process.env.YO_API_TOKEN);
})();

function handleSubscriber(doc, next) {
  var last = moment(doc.lastUpdate);

  // detect if there are updates to the subreddit
  async.detect(doc.following, function(subreddit, cb) {
    request.get('http://www.reddit.com/r/' + subreddit + '/new.json').end(function(err, res) {
      if (err) {
        cb(err);
      }
      var posts = res.body.data.children;
      cb(_.find(posts, function(post) {
        return last.isBefore(post.created_utc);
      }));
    });
  }, function(result) {
    if (!result) {
      return next();
    }

    console.log('Found new posts for user ' + doc.yo + ' in subreddit /r/' + result + '!');
    yo.yo(doc.yo, function() {
      doc.lastUpdate = new Date();
      doc.save(next);
    });
  });
};

function updateSubscribers() {
  Subscriber.find().exec(function(err, docs) {
    async.each(docs, function(doc, next) {
      handleSubscriber(doc, next);
    }, function(err) {
      if (err) {
        console.log(err);
      }
      console.log('Updated ' + docs.length + ' subscribers.');
    });
  });
}
setInterval(updateSubscribers, 60000);
updateSubscribers();

// Start server
server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

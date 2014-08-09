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
    lastUpdated: Date
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
  var i, entry;
  s.Subscriber
    .find(function (err, doc) {
      if(doc)
      {
        for(i = 0; i< doc.length; i++){
          entry = doc[i];
          s.getPage(entry.url,
            function (entry,error, response, body) {
              if (!error && response.statusCode == 200)
              {
                if(body != entry.body)
                {
                  entry.body = body;
                  entry.save(function(err) {
                    if(!err)
                    {
                      console.log('OK');
                    }
                    else
                    {
                      console.log(err);
                    }
                  });
                  console.log('Found new listings for user ' + entry.yo + ' !');
                  yo.yo(entry.yo, function() {
                    console.log("Yo'ed user" + entry.yo + ' !');
                  });
                  setTimeout()
                }
                else
                {
                  console.log('You are now subscribed!');
                }
              }
              else
              {
                console.log(error);
              }
            }.bind(this, entry)
          );
        }
      }
    });
};

var interval = setInterval(updateSubscription, 61000);


server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

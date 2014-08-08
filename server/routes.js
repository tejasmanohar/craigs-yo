/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var mongoose = require('mongoose');
var request = require('request');
var Subscriber = require('./app').Subscriber;

function handleNewSubscriber(url, yoName, cb) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var Subscriber = mongoose.model('Subscriber');
      var doc = new Subscriber({
            yo: yoName.toLowerCase(),
            url: url,
            body: body
      });
      cb(null, doc);
    }
  });
};

module.exports = function(app) {
  app.route('/register')
    .post(function(req, res) {
      console.log('/register');
      var yoName = req.body.yoName;
      var link = req.body.link;

      var Subscriber = mongoose.model('Subscriber');
      Subscriber.findOne({
        yo: yoName
      }).exec(function(err, doc) {
        console.log(err);
        if (!doc) {
          handleNewSubscriber(link, yoName.toLowerCase(),
            function (err, newDoc) {
              newDoc.save(function(err) {
                res.send('OK');
              });
          });
        } else {
          doc.following.push(link);
          doc.save(function(err) {
            res.send('OK');
          });
        }
    });
  });

  app.route('/unsubscribe')
    .get(function(req, res) {
      var username = req.query.username.toLowerCase();
      var Subscriber = mongoose.model('Subscriber');
      Subscriber.remove({
        yo: username
      }).exec(function(err) {
        if (err) {
          res.status(404).send('Username does not exist');
          return;
        }
        res.send('OK');
      });
    });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};

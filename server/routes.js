/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var mongoose = require('mongoose');

module.exports = function(app) {
  app.route('/register')
    .post(function(req, res) {
      var yoName = req.body.yoName;
      var subreddit = req.body.subreddit;

      var Subscriber = mongoose.model('Subscriber');
      Subscriber.findOne({
        yo: yoName
      }).exec(function(err, doc) {
        if (!doc) {
          doc = new Subscriber({
            yo: yoName.toLowerCase(),
            following: [subreddit],
            lastUpdate: new Date()
          });
        } else {
          doc.following.push(subreddit);
        }
        doc.save(function(err) {
          res.send('OK');
        });
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

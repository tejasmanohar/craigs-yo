/**
 * Main application routes
 **/

'use strict';

var md5 = require('MD5');
var mongoose = require('mongoose');
var request = require('superagent');

module.exports = function(app) {
  var errors = require('./components/errors');

  var Subscriber = mongoose.model('Subscriber');

  app.post('/register', function(req, res) {
    if (!req.body.yoName) {
      return;
    }

    if (!req.body.link) {
      return;
    }

    var yoName = req.body.yoName.toLowerCase();
    var link = req.body.link;

    Subscriber.findOne({
      "yo": yoName
    }, function(err, doc) {
      if (doc) {
        return res.status(400).send('You are already subscribed to an address.');
      }

      request.get(link).end(function(error, response) {
        console.log(response);
        if (error) {
          console.log(error);
          return res.status(400).send('Error');
        }

        var doc = new Subscriber({
          yo: yoName,
          url: link,
          hash: md5(response.text)
        });

        doc.save(function(err) {
          if (!err) {
            res.send('OK');
          } else {
            console.log(response);
            console.log(error);
            res.send(err);
          }
        });
      });
    });
  });

  app.get('/unsubscribe', function(req, res) {
    if (!req.query.username) {
      return res.status(400).send('username not specified.');
    }

    var yoName = req.query.username.toLowerCase();
    Subscriber.remove({
      yo: yoName
    }, function(err, result) {
      if (result) {
        res.send('OK');
      } else {
        res.status(404).send('Username does not exist');
      }
    });
  });


  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);


  app.route('/*').get(function(req, res) {
    res.sendfile(app.get('appPath') + '/index.html');
  });
};

/**
 * Main application routes
 */

'use strict';

module.exports = function(app, s) {
  var errors = require('./components/errors');

  app.post('/register', function(req, res) {
    var yoName = req.body.yoName.toLowerCase(),
      link = req.body.link;

    s.Subscriber
      .findOne({
        "yo": yoName
      }, function(err, doc) {
        console.log(err, doc);
        if (doc) {
          s.getPage(link,
            function(error, response) {
              if (!error && response.statusCode == 200) {
                if (doc.url !== link) {
                  doc.body = response.body;
                  doc.save(function(err) {
                    if (!err) {
                      console.log(err);
                      res.send('OK');
                    } else {
                      console.log(err);
                      res.send(err);
                    }
                  });
                } else {
                  res.send('You are already subscribed for this address');
                }
              } else {
                res.send(error);
              }
            }
          );
        } else {
          s.getPage(link,
            function(error, response) {
              if (!error && response.statusCode == 200) {
                var doc = new s.Subscriber({
                  yo: yoName,
                  url: link,
                  body: response.body
                });

                doc.save(function(err) {
                  if (!err) {
                    res.send('OK');
                  } else {
                    res.send(err);
                  }
                });
              } else {
                console.log(error);
                res.send(error);
              }
            }
          );
        }
      });
  });

  app.get('/unsubscribe', function(req, res) {
    var yoName = req.query.username.toLowerCase();
    s.Subscriber.remove({
      "yo": yoName
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

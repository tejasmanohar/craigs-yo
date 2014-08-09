/**
 * Main application routes
 */

'use strict';

module.exports = function(app,s){
  var errors = require('./components/errors');

  app.post('/register', function (req, res) {
    var yoName = req.body.yoName.toLowerCase(), link = req.body.link;

    s.Subscriber
      .findOne({"yo" : yoName}, function (err, doc) {
        console.log(err, doc);
        if(doc)
        {
          s.getPage(link,
            function (error, response, body) {
              if (!error && response.statusCode == 200)
              {
                if(doc.url !== link)
                {
                  doc.body = body;
                  doc.save(function(err) {
                    if(!err)
                    {
                      console.log("heloo");
                      res.send('OK');
                    }
                    else
                    {
                      console.log("qwerty");
                      res.send(err);
                    }
                  });
                }
                else
                {
                  console.log("jklm");
                  res.send('You are already subscribed for this address');
                }
              }
              else
              {
                console.log("zxc");
                res.send(error);
              }
            }
          );
        }
        else
        {
          s.getPage(link,
            function (error, response, body) {
              if (!error && response.statusCode == 200)
              {
                console.log("testtestestest");
                var doc = new s.Subscriber({
                  yo: yoName,
                  url: link,
                  body: body
                });

                doc.save(function(err) {
                  if(!err)
                  {
                    console.log("hereeee");
                    res.send('OK');
                  }
                  else
                  {
                    console.log("asdf");
                    res.send(err);
                  }
                });
              }
              else
              {
                console.log(response);
                console.log(body);
                res.send(error);
              }
            }
          );
        }
      });
  });

  app.get('/unsubscribe', function (req, res) {
    var yoName = req.query.username.toLowerCase();
    s.Subscriber.remove({"yo" : yoName}, function (err, result) {
      if(result)
      {
        res.send('OK');
      }
      else
      {
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

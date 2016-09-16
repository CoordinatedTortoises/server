var db = require('../models/Database.js');
//creates tokens for signin.
var jwt = require('jwt-simple');

module.exports = {
  //signup
  createUser: function(req, res, next) {
    console.log(req.body);
    db.User.create(req.body)
      .then(function(newUser) {
        var token = jwt.encode(newUser, 'secret');
        console.log(token);
        res.status(201).json({
          token: token
        });
      })
      .catch(function(err) {
        res.status(404).json(err);
      });
  },

  findUser: function(req, res, next) {
    if (req.query.username) {

      var username = req.query.username;
      if (!username) {
        return res.status(200).json([]);
      }
      db.User.findAll({ 
        attributes: ['id', 'username', 'fullname'],
        where: {username: { $iLike: '%' + username + '%' }}
      })
        .then(function(result) {
          res.status(200).json(result);
        })
        .catch(function(err) {
          res.status(404).json(err);
        });
      } else if (req.query.ssid) {
        var ssid = req.query.ssid;
        db.User.findAll({
          where: {
            recentSSID: {
              $ilike: '%' + ssid + '%'
            }
          }
        })
        .then(function(result) {
          res.status(200).json(result);
        })
        .catch(function(err) {
          res.status(404).json(err);
        });
      }
  },
  updateUser: function(req, res, next) {
    var id = req.user.id;
    db.User.update({recentSSID: req.body.ssid}, {
      where: {id: id}
    })
    .then(function(result){
      console.log(result);
      res.status(204).json(result);
    })
    .catch(function(err) {
      res.status(404).json(err);
    });

  },
  signIn: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    db.User.findOne({ where: {username: username}} )
    .then(function (user) {
      if (!user) {
        res.status(404).json({ error: 'User does not exist' });
      } else {
        if (password === user.password) {
          var token = jwt.encode(user, 'secret');
          res.json({token: token});
        } else {
          res.status(401).json({error: 'Incorrect password'});
        }
      }
    })
    .catch(function(err) {
      res.json(err);
    });
  }
};
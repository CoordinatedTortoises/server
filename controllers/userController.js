var db = require('../models/Database.js');
//creates tokens for signin.
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var secrets;
if (process.env.DATABASE_URL) {
  secrets = {};
  secrets.tokenKey = process.env.TOKEN_KEY;
  secrets.phoneNumberKey = process.env.PHONE_NUMBER_KEY;
} else {
  secrets = require('../config/encodeTokens.js');
}


module.exports = {
  //signup
  createUser: function(req, res, next) {
    bcrypt.hash(req.body.password, 7, function(err, hash){
      req.body.password = hash;
      req.body.phoneNumber = jwt.encode(req.body.phoneNumber, secrets.phoneNumberKey);
      db.User.create(req.body)
        .then(function(newUser) {
          var falseUser = newUser;
          falseUser.phoneNumber = jwt.decode(newUser.phoneNumber, secrets.phoneNumberKey);
          falseUser.password = 'Stop looking at this';
          var token = jwt.encode(falseUser, secrets.tokenKey);
          res.status(201).json({token: token});
        })
        .catch(function(err) {
          res.status(404).json(err);
        });
    })
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
      } else if (req.query.ssid && req.query.ip) {
        bcrypt.hash(req.body.ssid + req.body.ip, function(err, hash){
          db.User.findAll({
            where: {
              recentSSIPhash: {
                $ilike: '%' + hash + '%'
              }
            }
          })
          .then(function(result) {
            res.status(200).json(result);
          })
          .catch(function(err) {
            res.status(404).json(err);
          });
        });
      }
  },
  updateUser: function(req, res, next) {
    var id = req.user.id;
    bcrypt.hash(req.body.ssid + req.body.ip, function(err, hash){
      db.User.update({recentSSIPhash: hash}, {
        where: {id: id}
      })
      .then(function(result){
        res.status(204).json(result);
      })
      .catch(function(err) {
        res.status(404).json(err);
      });
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
        bcrypt.compare(password, user.password, function(err, match){
          if (match) {
            var falseUser = JSON.parse(JSON.stringify(user));
            falseUser.phoneNumber = jwt.decode(user.phoneNumber, secrets.phoneNumberKey);
            falseUser.password = 'Stop looking at this';
            var token = jwt.encode(falseUser, secrets.tokenKey);
            res.json({token: token});
          } else {
            res.status(401).json({error: 'Incorrect password'});
          }
        })
      }
    })
    .catch(function(err) {
      res.json(err);
    });
  }
};
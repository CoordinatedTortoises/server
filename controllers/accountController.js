var db = require('../models/Database.js');

module.exports = {
  deleteAcct: function(req, res, next) {
    var username = req.body.username;
    db.User.destroy({ where: {username: username} }).then(function(result) {
      res.status(200).send('Successfully deleted');
    }).catch(function(err) {
      console.log(err, 'error');
      res.status(500).send('Error in deletion');
    });
  } 
};
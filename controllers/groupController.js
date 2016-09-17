var db = require('../models/Database.js');

module.exports = {
  //Post to groups
  createGroup: function(req, res, next) {
    var name = req.body.name;
    db.Group.create({name: name})
    .then(function(group) {
      res.status(200).send(JSON.stringify(group));
    })
    .catch(function(err) {
      res.status(404).json(err);
    });
  },
  //Put request
  joinGroup: function(req, res, next) {

    

  }

};

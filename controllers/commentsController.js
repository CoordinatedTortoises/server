var db = require('../models/Database.js');

module.exports = {

  get: function(req, res, next) {

    db.Comments.findAll({
      where: {
        entryId: req.query.entryId
      }
    })
    .then(function(comments) {
      res.status(200).send(JSON.stringify(comments));
    })
    .catch(function(err) {
      res.status(404).json(err);
    });

  },

  post: function(req, res, next) {

    var query = req.body;

    db.Comments.create(query)
    .then(function(entry) {
      res.status(200).send('Success');
    })
    .catch(function(err) {
      res.status(404).json(err);
    });

  }

};

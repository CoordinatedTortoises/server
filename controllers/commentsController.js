var db = require('../models/Database.js');

module.exports = {

  get: function(req, res, next) {
    
    db.Comments.findAll({
      where: {
        userId: req.query.userId,
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
    query.userId = req.user.id;
    query.entryId = req.entry.id;
    
    db.Comments.create(query)
    .then(function(entry) {
      res.status(200).send('Success');
    })
    .catch(function(err) {
      res.status(404).json(err);
    });

  }

};

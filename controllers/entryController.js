var db = require('../models/Database.js');

module.exports = {

  createEntry: function(req, res, next) {
    var query = req.body;
    query['userId'] = req.user.id;
    db.Entry.create(query)
      .then(function(newEntry) {
        res.send('Success');
      })
      .catch(function(err) {
        res.status(404).json(err);
      });
  },

  getEntries: function(req, res, next) {
    var searchParams = req.query.tags ? JSON.parse(req.query.tags) : [];
    if (req.query.userId && (req.query.userId !== req.user.id.toString())) {
      // check if req.query.userId is in friendlist
      db.Relationships.findOne({ 
        where: { user1: req.user.id, user2: req.query.userId }
      })
        .then(function(friends) {
          if (friends) {
            // send entries
            db.Entry.findAll({ 
              where: { 
                userId: req.query.userId,
                tags: {
                  $contains: searchParams
                }
              },
              order: [['createdAt', 'DESC']]
            })
              .then(function(entries) {
                res.send(entries);
              })
              .catch(function(err) {
                res.status(404).json(err);
              });
          } else {
            res.status(404).json({ error: 'you are not friends'});
          }
        })
        .catch(function(err) {
          res.status(404).json(err);
        });
    } else {
      db.Entry.findAll({ 
        where: { 
          userId: req.user.id,
          tags: {
            $contains: searchParams
          }
        },
        order: [['createdAt', 'DESC']]
      })
      .then(function(entries) {
        res.send(entries);
      })
      .catch(function(err) {
        res.status(404).json({error: 'Error retrieving entires: ' + err});
      });
    }
  },

  deleteEntries: function(req, res) {
    //req has array of selected entry ids
      //for each id, delete entry in the db.
  }
};
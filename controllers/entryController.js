var db = require('../models/Database.js');

module.exports = {

  createEntry: function(req, res, next) {
    var query = req.body;
    query.userId = req.user.id;
    db.Entry.create(query)
      .then(function(newEntry) {
        res.send('Success');
      })
      .catch(function(err) {
        console.log(err);
        res.status(404).json(err);
      });
  },

  removeEntries: function(req, res, next) {
    //Somehow get the users id
    var query = {
      //for all entries of userId
      userId: req.body.userId
    };
    if (req.query.messageId) {
      //if get request from ..., query has id prop
      query.id = req.query.messageId;
    }

    db.Entry.destroy({
      where: query
    }).then(function(entries) {
      console.log('Delete was a success: ', entries);
      res.send(200);
    }).catch(function(err) {
      res.send(err);
    });

  },

  getEntries: function(req, res, next) {
    var searchParams = req.query.tags ? JSON.parse(req.query.tags) : [];

    var filterByTags = function(entries, tagList) {

      var hasIntersect = function(a, b) {

        var commonElement = false;

        a.forEach(function(item) {
          if (b.indexOf(item) > -1) {
            commonElement = true;
          }

        });

        return commonElement;
      };

      if (tagList.length > 0) {

        var tagEntries = entries.filter(function(entry) {

          var lowerCaseTags = entry.tags.map(function(tag) {
            return tag.toLowerCase();
          });

          return hasIntersect(lowerCaseTags, tagList);
        });

        return tagEntries;

      } else {

        return entries;

      }
    };

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
                userId: req.query.userId
              },
              order: [['createdAt', 'DESC']]
            })
              .then(function(entries) {
                entries = filterByTags(entries, searchParams);
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
          console.log(err);
          res.status(404).json(err);
        });
    } else {
      db.Entry.findAll({
        where: {
          userId: req.user.id
        },
        order: [['createdAt', 'DESC']]
      })
      .then(function(entries) {
        entries = filterByTags(entries, searchParams);
        res.send(entries);
      })
      .catch(function(err) {
        console.log(err);
        res.status(404).json({error: 'Error retrieving entires: ' + err});
      });
    }
  }
};

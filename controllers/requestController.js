var db = require('../models/Database.js');

module.exports = {
  sendRequest: function(req, res, next) {
    var newRequest = {
      userId: req.user.id,
      requestReceiver: req.body.requestReceiver,
      status: 'CREATED'
    }
    // check if you are friends
    db.Relationships.findOne({
      where: { user1: newRequest.userId, user2: newRequest.requestReceiver }
    })
      .then(function(friends) {
        if (friends) {
          return res.status(404).json({ error: 'Already friends'});
        }
        // check if request already exists
        db.Request.findOrCreate({
          where: newRequest
        })
          .spread(function(request, created){
            if (created) { 
              return res.status(201).send("Success") 
            } else {
              res.status(404).json({ error: 'Already created'});
            }
          })
          .catch(function(err){
            res.status(404).json(err)
          });
      })
      .catch(function(err) {
        res.status(404).json(err)
      });

  },

  getRequests: function(req, res, next) {
    db.Request.findAll({
      where: { requestReceiver: req.user.id, status: 'CREATED' },
      include: {
        model: db.User,
        attributes: ['fullname']
      }
    })
      .then(function(requestList) {
        res.status(200).json(requestList);
      })
      .catch(function(err) {
        res.status(404).json(err);
      });
  },

  acceptRequest: function(req, res, next) {
    db.Request.findOne({ where: req.body.requestId })
      .then(function(result) {
        if (result) {
          if (result.requestReceiver === req.user.id) {
            // create entries in friends table
            return db.Relationships.bulkCreate([
                { user1: result.userId, user2: result.requestReceiver },
                { user1: result.requestReceiver, user2: result.userId }
              ])
              .then(function(){
                // update status in requests
                db.Request.update({ status: 'ACCEPTED'}, {
                  where: { id: result.id }
                })
                  .then(function() {
                    res.status(201).send("Success");
                  })
                  .catch(function(err) {
                    res.status(404).json(err);
                  })
              })
              .catch(function(err){
                res.status(404).json(err)
              })
          } else {
            return res.status(404).json({ error: 'You are not receiver of this request'});
          }
        }
        res.status(404).json({ error: 'Request not found'});
      })
      .catch(function(err) {
        res.status(404).json(err);
      })
  }
}
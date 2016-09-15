var entryController = require('../controllers/entryController.js');
var userController = require('../controllers/userController.js');
var friendsController = require('../controllers/friendsController.js');
var requestController = require('../controllers/requestController.js');
var accountController = require('../controllers/accountController.js');

var utils = require('./utils.js');


module.exports = function(app, express) {
  app.post('/api/signup', userController.createUser);
  app.post('/api/signin', userController.signIn);

  app.use('/api/entries', utils.decode);
  app.post('/api/entries', entryController.createEntry);
  app.get('/api/entries', entryController.getEntries);
  // ----- CBELLE ----- //
  //app.delete('/api/entries', entryController.deleteEntries);

  app.use('/api/users', utils.decode);
  app.get('/api/users', userController.findUser);

  // ----- CBELLE ----- //
  app.use('/api/account', utils.decode);
  app.delete('/api/account', accountController.deleteAcct);

  app.use('/api/friends', utils.decode);
  app.get('/api/friends', friendsController.fetchFriends);
  app.post('/api/friends', friendsController.acceptFriendReq);
  // --- CBELLE ----- //
  // app.delete('/api/friends', friendsController.deleteFriends);

  app.use('/api/friendreq', utils.decode);
  app.post('/api/friendreq', function(req, res, next) {
    if (req.body.requestId) {
      requestController.acceptRequest(req, res, next);
    } else {
      requestController.sendRequest(req, res, next);
    }
  });
  app.get('/api/friendreq', requestController.getRequests);
  app.delete('/api/friendreq', requestController.rejectRequest);
};

var Sequelize = require('sequelize');
var connectionString;
if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
} else {
  var connectionString = require('../config/db.js');
}

var sequelize = new Sequelize(connectionString, {
  native: true
});

// Define the model that corresponds to the entry table in the database.
var User = sequelize.define('user', {
  username: {type: Sequelize.STRING, unique: true },
  password: Sequelize.STRING,
  fullname: Sequelize.STRING
});

// Define the model that corresponds to the entry table in the database.
var Entry = sequelize.define('entry', {
  text: Sequelize.STRING,
  location: Sequelize.STRING,
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    defaultValue: []
  }
});

// Define the model that corresponds to the comment table in the database.
var Comments = sequelize.define('comments', {
  text: Sequelize.STRING,
  location: Sequelize.STRING
});

var Relationships = sequelize.define('relationships', {
  user1: Sequelize.INTEGER,
  user2: Sequelize.INTEGER
});

var Request = sequelize.define('request', {
  requestReceiver: Sequelize.INTEGER,
  status: Sequelize.STRING
}, {
  validate: {
    requestReceiverMustNotBeFriend: function(next) {
      Relationships.findOne({
        where: { user1: this.userId, user2: this.requestReceiver }
      })
        .then(function(friends) {
          if (friends) {
            next('requestReceiver must NOT be a friend');
          } else {
            next();
          }
        });
    },
    mustNotBeDuplicateRequest: function(next) {
      Request.findOne({ where: {
        userId: this.userId,
        requestReceiver: this.requestReceiver,
        status: this.status
      } })
        .then(function(exists) {
          if (exists) {
            next('Request already exists');
          } else {
            next();
          }
        });
    }
  }
});

// puts a UserId column on each Entry instance
// also gives us the `.setUser` method available
// after creating a new instance of Entry
Entry.belongsTo(User);
Request.belongsTo(User);

Comments.belongsTo(User);
Comments.belongsTo(Entry);

User.hasMany(Entry);
User.hasMany(Request);

User.hasMany(Comments);
Entry.hasMany(Comments);

User.sync();
Entry.sync();
Relationships.sync();
Request.sync();

Comments.sync();

module.exports.User = User;

module.exports.Entry = Entry;
module.exports.Relationships = Relationships;
module.exports.Request = Request;
module.exports.Comments = Comments;

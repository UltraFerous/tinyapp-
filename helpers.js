const emailValidator = function(email, users) {
  for (let keys in users) {
    if (users[keys].email === email) {
      return false;
    }
  }
  return true;
};

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const getUserByEmail = function(email, database) {
  
  for(let users in database){
    if(database[users].email === email){
      return database[users];
    }
  }
};

module.exports = { emailValidator, getUserByEmail };
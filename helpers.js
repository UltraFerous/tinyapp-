const emailValidator = function(email, users) {
  for (let keys in users) {
    if (users[keys].email === email) {
      return false;
    }
  }
  return true;
};

const getUserByEmail = function(email, database) {

  for (let users in database) {
    if (database[users].email === email) {
      return database[users];
    }
  }
};

const generateRandomString = function() {
  let string = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    string += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return string;
};

const filterDataBase = function(database, key) {
  let returnKey = {};
  for (let shortURLs in database) {
    if (database[shortURLs].userID === key || database[shortURLs].userID === 'admin') {
      returnKey[shortURLs] = database[shortURLs];
    }
  }
  return returnKey;
};

module.exports = { emailValidator, getUserByEmail, generateRandomString, filterDataBase };
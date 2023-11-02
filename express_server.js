const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const generateRandomString = function() {
  let string = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    string += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return string;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@b.com", //user@example.com
    password: "123", //purple-monkey-dinosaur
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "c@d.ca", //user2@example.com
    password: "123", //dishwasher-funk
  },
  admin: {
    id: "admin",
    email: "admin@admin.com",
    password: "admin", 
  },
  undefined: {
    id: undefined,
    email: undefined, //user2@example.com
    password: undefined, //dishwasher-funk
  }
};

const emailValidator = function(email) {
  for (let keys in users) {
    if (users[keys].email === email) {
      return false;
    }
  }
  return true;
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "admin"
  }
};

const filterDataBase = function(database, key){
  let returnKey = {};
  for(let shortURLs in database){
    if(database[shortURLs].userID === key || database[shortURLs].userID === 'admin'){
      returnKey[shortURLs] = database[shortURLs];
    }
  }
  return returnKey;
};

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.id],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = generateRandomString();

  if (req.body.password === "" || req.body.password === "") {
    res.status(400);
    return res.send("Error: No Username or Password was entered.");
  };

  if (emailValidator(email) === false) {
    res.status(400);
    return res.send("Error: This email has already been used.");
  }

  users[userID] = {
    id: userID.toString(),
    email: email.toString(),
    password: password.toString(),
  };

  res.cookie('id', userID);
  return res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.id],
  };
  if (req.cookies.id === undefined) {
    return res.redirect(`/login`);
  }
  return res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  for (let index in users) {
    if (users[index].email === email) {
      if (users[index].password !== password) {
        res.status(403);
        return res.send("Error 403: That was an invalid login, please try again.");
      }
      res.cookie('id', users[index].id);
      res.redirect(`/urls`);
    }
  }
  res.status(403);
  res.send("Error 403: This account does not exist. Please try again.");
});

app.get("/login", (req, res) => {
  if (req.cookies.id !== undefined) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user: users[req.cookies.id],
  };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  if (req.cookies.id === undefined) {
    return res.send("You must be logged in to shorten URLs!");
  }
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.id
  };
  res.redirect(`/urls/${newURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if(typeof urlDatabase[req.params.id] === 'undefined'){
    return res.send("Error: This URL is undefined.")
  }
  if(urlDatabase[req.params.id].userID !== req.cookies.id){
    return res.send("Error: You do not have permission to delete this URL.");
  }
  if(req.cookies.id === undefined){
    return res.send("Error: Please login first or create an account.")
  }
  delete urlDatabase[(req.params.id)];
  res.redirect(`/urls/`);
});

app.post("/logout/", (req, res) => {
  res.clearCookie('id');
  res.redirect(`/login`);
});

app.post("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id].userID !== req.cookies.id){
    return res.send("Error: You do not have permission to edit this URL.");
  }
  urlDatabase[(req.params.id)].longURL = req.body.longURL;
  res.redirect(`/urls/`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[(req.params.id)].longURL;
  if (longURL === undefined) {
    res.statusCode = 404;
    return res.send("Error 404: Page Not Found. This URL does not exist.");
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => { //"/urls.json"
  if (req.cookies.id === undefined) {
    return res.send("You must be logged in to view shorten URLs!");
  }
  console.log(urlDatabase);
  const templateVars = {
    urls: filterDataBase(urlDatabase, req.cookies.id),
    user: users[req.cookies.id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if(typeof urlDatabase[req.params.id] === 'undefined'){
    return res.send("Error: This URL is undefined.")
  }
  if(req.cookies.id === undefined){
    return res.send("Error: Please login first or create an account.")
  }
  if(urlDatabase[req.params.id].userID !== req.cookies.id){
    return res.send("Error: You do not have permission to edit this URL.");
  }
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
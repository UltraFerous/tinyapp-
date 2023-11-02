const PORT = 8080; // default port 8080
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { emailValidator, getUserByEmail, generateRandomString, filterDataBase } = require('./helpers');

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['45rq4w4r8w84r847qw874r78'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true }));

const users = {
  undefined: {
    id: undefined,
    email: undefined,
    password: undefined,
  }
};

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect(`/register`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.id],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  let userID = generateRandomString();

  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    return res.send("Error: No Username or Password was entered.");
  }

  if (emailValidator(email, users) === false) {
    res.status(400);
    return res.send("Error: This email has already been used.");
  }

  users[userID] = {
    id: userID.toString(),
    email: email.toString(),
    password: password.toString(),
  };

  req.session.id = userID;
  return res.redirect(`/urls`);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.id],
  };
  if (req.session.id === undefined) {
    return res.redirect(`/login`);
  }
  return res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.id !== undefined) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user: users[req.session.id],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userRequest = getUserByEmail(email, users);
  
  if (typeof userRequest === 'undefined') {
    res.status(403);
    return res.send("Error 403: That was an invalid login, please try again.");
  }
  
  if (userRequest.email === email) {
    if (!bcrypt.compareSync(password, userRequest.password)) {
      res.status(403);
      return res.send("Error 403: That was an invalid login, please try again.");
    }
    req.session.id = userRequest.id;
    res.redirect(`/urls`);
  }
  
  res.status(403);
  res.send("Error 403: This account does not exist. Please try again.");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[(req.params.id)].longURL;
  if (longURL === undefined) {
    res.statusCode = 404;
    return res.send("Error 404: Page Not Found. This URL does not exist.");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (typeof urlDatabase[req.params.id] === 'undefined') {
    return res.send("Error: This URL is undefined.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.id) {
    return res.send("Error: You do not have permission to delete this URL.");
  }
  if (req.session.id === undefined) {
    return res.send("Error: Please login first or create an account.");
  }
  delete urlDatabase[(req.params.id)];
  res.redirect(`/urls/`);
});

app.post("/logout/", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.get("/urls", (req, res) => { //"/urls.json"
  if (req.session.id === undefined) {
    return res.send("You must be logged in to view shorten URLs!");
  }
  const templateVars = {
    urls: filterDataBase(urlDatabase, req.session.id),
    user: users[req.session.id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  if (req.session.id === undefined) {
    return res.send("You must be logged in to shorten URLs!");
  }
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.session.id
  };
  res.redirect(`/urls/${newURL}`);
});

app.get("/urls/:id", (req, res) => {
  if (typeof urlDatabase[req.params.id] === 'undefined') {
    return res.send("Error: This URL is undefined.");
  }
  if (req.session.id === undefined) {
    return res.send("Error: Please login first or create an account.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.id) {
    return res.send("Error: You do not have permission to edit this URL.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.id) {
    return res.send("Error: You do not have permission to edit this URL.");
  }
  urlDatabase[(req.params.id)].longURL = req.body.longURL;
  res.redirect(`/urls/`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
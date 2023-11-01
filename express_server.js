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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    res.send("Error: No Username or Password was entered.");
  };

  if(emailValidator(email) === false){
    res.status(400);
    res.send("Error: This email has already been used.");
  }

  users[userID] = {
    id: userID.toString(),
    email: email.toString(),
    password: password.toString(),
  };

  res.cookie('id', userID);
  res.redirect(`/urls`);
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
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[(req.params.id)];
  res.redirect(`/urls/`);
});

app.post("/login/", (req, res) => {
  res.redirect(`/register`);
});

app.post("/logout/", (req, res) => {
  res.clearCookie('id');
  res.redirect(`/urls/`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[(req.params.id)] = req.body.longURL;
  res.redirect(`/urls/`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.statusCode = 404;
    res.send("404 Page Not Found.");
    return;
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => { //"/urls.json"
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL: urlDatabase[req.params.id],
    user: users[req.cookies.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
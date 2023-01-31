require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

try {
  mongoose.set("strictQuery", false);
  mongoose.connect("mongodb://localhost:27017/userDB", () => {
    console.log("Connected to MongoDB");
  });
} catch (error) {
  console.log(error);
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      // Store hash in your password DB.
      const newUser = new User({
        email: username,
        password: hash,
      });
      newUser.save((err) => {
        if (err) return res.send(err);
        res.render("secrets");
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ email: username }, (err, result) => {
    if (err) return res.send(err);
    if (result) {
      bcrypt.compare(password, result.password, (err, result) => {
        // result == true
        if (result === true) {
          res.render("secrets");
        }
      });
    }
  });
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

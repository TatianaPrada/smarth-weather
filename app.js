//Middleware for .env
require("dotenv/config");

//Import Mongo connection
require("./db/index.js");

//Variables
const express = require("express");
const app = express();
const chalk = require("chalk");
const PORT = process.env.PORT || 5000;
const hbs = require("hbs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const axios = require("axios");

//Middleware de hbs
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

//Middleware de body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Middleware de sessions
require("./config/session.config")(app);

//Middleware para archivos estaticos
app.use(express.static(__dirname + "/public"));

// Routes
app.use("/", require("./routes/home.js"));
app.use("/", require("./routes/auth.js"));
app.use("/", require("./routes/search.js"));


//error handling
app.use((req, res, next) => {
  // this middleware runs whenever requested page is not available
  res.status(404).render("not-found");
});

app.use((err, req, res, next) => {
  // whenever you call next(err), this middleware will handle the error
  // always logs the error
  console.error("ERROR", req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).render("error");
  }
});

//App listener
app.listen(PORT, () => {
  console.log(chalk.bgGreen(`Server running in port ${PORT}`));
});

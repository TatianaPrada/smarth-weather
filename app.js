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
//const cookieParser = require("cookie-parser");

//Middleware de hbs
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

//Middleware de body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

//Middleware de sessions
//require("./config/session.config")(app);

//Middleware para archivos estaticos
app.use(express.static(__dirname + "/public"));


// 👇 Start handling routes here
app.use("/", require("./routes/home.js"));
app.use("/", require("./routes/auth.js"));

//App listener
app.listen(PORT, () => {
  console.log(chalk.bgGreen(`Server running in port ${PORT}`));
});

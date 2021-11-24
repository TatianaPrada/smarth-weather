const router = require("express").Router();
const bcrypt = require("bcryptjs");

//Model
const User = require("../models/User.model");

//Middleware
const {isLoggedOut} = require("../middleware/route-guard")
const {isLoggedIn} = require("../middleware/route-guard")

//GET routes
router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("user/signup");
});

router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("user/login");
});

router.get("/my-profile", isLoggedIn, async (req, res, next) => {
  //console.log(req.session.loggedUser)
  const currentUser = req.session.loggedUser
  const userCities = await User.findById(req.session.loggedUser).populate('myCities')
  const myCities = userCities. myCities
  res.render("user/myProfile", {currentUser, myCities});
  
});

//POST to create a new user
router.post("/signup", isLoggedOut, async (req, res, next) => {
    const { username, name, email, password, passwordRepeat } = req.body;
    if (!username || !email || !name || !password || !passwordRepeat) {
      res.render("user/signup", { msg: "Please fill all the inputs" });
      return;
    }
    if (password !== passwordRepeat) {
      res.render("user/signup", { msg: "The 2 passwords don't match" });
      return;
    }
    if (password.length < 8) {
      res.render("user/signup", {
        msg: "Your password should be at least 8 characters long",
      });
      return;
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.render("user/signup", { msg: "This user has already an account" });
      return;
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.render("user/signup", { msg: "This email has already an account" });
      return;
    }
    if (/\S+@\S+\.\S+/.test(email) === false) {
      res.render("user/signup", { msg: "Please write a valid email" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await User.create({
        username,
        name,
        email,
        password: hashedPassword,
      });
      res.render("user/signup", { msg: `Your account was succesfully created, now you can login to access into your account`});
    } catch (err) {
      console.log(err);
    }
});

//POST for login session
router.post("/login", isLoggedOut, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.render("user/login", { msg: "Please fill all the inputs" });
      return;
    }
    const existingUser = await User.findOne({ username: username });
    if (!existingUser) {
      res.render("user/login", { msg: "User doesn't exist, please verify the information" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      res.render("user/login", { msg: "Incorrect password" });
      return;
    }
    req.session.loggedUser = existingUser
    console.log(req.session.loggedUser)
    res.redirect("/my-profile")
    
});
  
  //POST logout
  router.get("/logout", async (req, res, next) => {
    res.clearCookie("connect.sid", { path: "/" });
  
    try {
      await req.session.destroy();
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  });
  

module.exports = router;


const router = require("express").Router();
const bcrypt = require("bcryptjs");
const axios = require("axios");
const moment = require("moment")

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
})

router.get("/my-profile/edit", isLoggedIn, async (req, res, next) => {
  const currentUser = req.session.loggedUser
  res.render("user/editProfile", {currentUser})
})

router.get("/my-profile/change-password", isLoggedIn, async (req, res, next) => {
  const currentUser = req.session.loggedUser
  res.render("user/editProfile", {currentUser})
});

//Route GET for profile
router.get("/my-profile", isLoggedIn, async (req, res, next) => {

  let currentUser = req.session.loggedUser
  try{
    const userCities = await User.findById(req.session.loggedUser).populate('myCities')
    const myCities = userCities.myCities
    
    let citiesArr = []
    let localtime = ""

    let date = ""


    let dateString = ""
   
      for(let i = 0; i < myCities.length; i++){
        const apiCall = await axios(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${myCities[i].name}+${myCities[i].country}&days=3&aqi=yes&alerts=no`)
        const cityInfo = apiCall.data

        date = cityInfo.location.localtime.split(" ")[0]
        dateString = moment(date).format("ll")

        localtime = cityInfo.location.localtime.split(" ")[1]
        cityInfo.location.localtime = localtime
        cityInfo.location.localtime_epoch = dateString
        cityInfo._id = myCities[i]._id.toString()
        citiesArr.push(cityInfo)
      }
    res.render("user/myProfile", {currentUser, citiesArr})
  } catch(err){
    console.log((err))
  }
})


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
        msg: "Your password must be at least 8 characters long",
      });
      return;
    }
    const existingUser = await User.findOne({username});
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
  const {username, password } = req.body;
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
  res.redirect("/my-profile")
});

//Route post for editing an user
router.post("/my-profile/edit", async (req, res, next) => {
  const {name, email, confirmPassword} = req.body
  let currentUser = req.session.loggedUser

    if (!name || !email ||!confirmPassword) {
      res.render("user/editProfile", { currentUser: currentUser, msg: "Please fill all the inputs" });
      return
    }
    if (/\S+@\S+\.\S+/.test(email) === false) {
      res.render("user/editProfile", { currentUser: currentUser, msg: "Please write a valid email" });
      return
    }
    const passwordMatch = await bcrypt.compare(confirmPassword, currentUser.password);
    if (!passwordMatch){
      res.render("user/editProfile", { currentUser: currentUser, msg: "Your password is incorrect" });
      return
    }
    try{

      const userUpdated = await User.findByIdAndUpdate(currentUser._id, req.body, {new:true})
      req.session.loggedUser = userUpdated
      res.render("user/editProfile", { currentUser: currentUser, msg: `Your account was succesfully updated`});
    }catch(err){
    console.log((err))
}
})

//Route POST for change the password
router.post("/my-profile/change-password", async (req, res, next) => {
  let {password, newPassword, confirmNewPassword} = req.body
  let currentUser = req.session.loggedUser
  console.log(req.body)
    if (!password || !newPassword ||!confirmNewPassword) {
      res.render("user/editProfile", {currentUser, msg2: "Please fill all the inputs" });
      return
    }
    const passwordMatch = await bcrypt.compare(password, req.session.loggedUser.password);
    if (!passwordMatch){
      res.render("user/editProfile", {currentUser, msg2: "Your password is incorrect" });
      return
    }
    if (newPassword.length < 8){
      res.render("user/editProfile", {currentUser, msg2: "Your new password must be at least 8 characters long" });
    }
    if (newPassword != confirmNewPassword){
      res.render("user/editProfile", {currentUser, msg2: "New passwords don't match" });
      return
    }
    try{
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      let userUpdated = await User.findByIdAndUpdate(currentUser._id, password = hashedPassword, {new:true})
      req.session.loggedUser = userUpdated
      res.render("user/editProfile", {currentUser, msg2: `Your password was succesfully updated`});
    }catch(err){
    console.log((err))
}
})
  
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


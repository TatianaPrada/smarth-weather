const router = require("express").Router();
const axios = require("axios")
const City = require("../models/cities.model")
const User = require("../models/User.model");

//My own middleware
const {isLoggedIn} = require("../middleware/route-guard")

//GET routes
router.get("/search", isLoggedIn, (req, res) => {
  res.render("cities/search.hbs");
});

router.get("/search/results", isLoggedIn, async (req, res) => {
    const destFromForm = req.query.cityName;
    try{
        const apiCall = await axios(`http://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_KEY}&q=${destFromForm}&aqi=no`)
        const destinations = apiCall.data
        res.render("cities/results", {destinations})
    } catch(err){
        console.log((err))
    }
})

//GET Route for each city

router.get("/results/city/:cityName", async (req, res) => {
    
    const cityName = req.params.cityName
    try{
        const apiCall = await axios(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${cityName}&days=3&aqi=yes&alerts=no`)
        const cityDetails = apiCall.data
        const forecastday = apiCall.data.forecast.forecastday
        const [day1, day2, day3] = forecastday
    
        let airQuality = cityDetails.current.air_quality['gb-defra-index']
        const airToString = ()=> {
            if(airQuality == "1") {airQuality = "Good"} 
            else if (airQuality == "2"){airQuality = "Moderate"}
            else if (airQuality == "3"){airQuality = "Unhealthy for sensitive groups"}
            else if (airQuality == "4"){airQuality = "Unhealthy"}
            else if (airQuality == "5"){airQuality = "Very Unhealthy"}
            else {airQuality = "Dangerous"}

            return airQuality
        }
        airToString()

        let uv = cityDetails.current.uv
        const uvIndex = ()=>{
            if(uv <= 2) {uv = "Low"} 
            else if (uv <= 5){uv = "Medium"}
            else if (uv <= 7){uv = "High"}
            else if (uv <= "10"){uv = "Very High"}
            else if (uv > "11"){uv = "Extremily High"}
            return uv
        }
        uvIndex()
        res.render("cities/city", {cityDetails, day1, day2, day3, airQuality, uv} )
    } catch(err){
        console.log((err))
    }
});

//Route POST for adding a city to profile
router.post("/city/add/:cityName", async (req, res) => {
    const cityName = req.params.cityName

    try{
        const apiCall = await axios(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${cityName}&days=3&aqi=yes&alerts=no`)
        const cityDetails = apiCall.data
        const forecastday = apiCall.data.forecast.forecastday
        const [day1, day2, day3] = forecastday
        const currentUser = await User.findById(req.session.loggedUser._id).populate("myCities")
        let exist = false

        currentUser.myCities.forEach((city)=>{
            if(city.name === cityDetails.location.name && city.country === cityDetails.location.country){
                exist = true
            }
        })
        if(!exist) {
            const dataToUpload = {
                name: cityDetails.location.name,
                country: cityDetails.location.country,
            }
        const justCreatedCity = await City.create(dataToUpload);
    
            await User.findByIdAndUpdate(
                req.session.loggedUser._id,
                { $push: { myCities: justCreatedCity._id } },
                { new: true }
            )
            res.redirect("/my-profile")
        }
        else{
            const myCities = currentUser. myCities
            res.render('user/myProfile', {currentUser, myCities, msg: "This city already exists"})
        }
    } catch(err){
        console.log((err))
    }
});


router.get("/city/delete/:cityId", isLoggedIn, async (req, res, next) => {
    const currentUser = req.session.loggedUser
    res.render("users/myProfile", {currentUser})
  })


  //**//
//Route Post for delete a city
router.post("/city/delete/:cityId", async (req, res) => {
    
    const cityId = req.params.cityId
    // const currentUser = await User.findById(req.session.loggedUser._id)
    //findOneAndDelete()
    const userId = req.session.loggedUser._id
    try{
        const editedUser = await User.findByIdAndUpdate(userId, {$pull: {myCities: cityId}}, {new: true}) 
        console.log(editedUser)
        res.redirect('/my-profile')
    } catch(err){
        console.log((err))
    }
});





module.exports = router;
const router = require("express").Router();
const axios = require("axios")
//API 
const net = require('follow-redirects').https;
const auth_key = Buffer.from(`${process.env.API_KEY}:${process.env.API_PASS}`).toString('base64');

//My own middleware
const {isLoggedIn} = require("../middleware/route-guard")

//GET routes
router.get("/search", (req, res) => {
  res.render("cities/search.hbs");
});


//GET Rroute for each city

router.get("/results/city/:cityName", async (req, res) => {
    
    const cityName = req.query.cityName
    console.log(cityName)
    try{
        const apiCall = await axios(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${cityName}&days=1&aqi=no&alerts=no`)
        const cityDetais = apiCall
        //console.log(cityDetais)
        res.render("cities/results", {cityDetais})

    } catch(err){
        console.log((err))
    }
    res.render("cities/city.hbs");
});


//POST route 
router.get("/search/results", async (req, res) => {
    const destFromForm = req.query.destinationName;
    console.log(destFromForm)
    try{
         const apiCall = await axios(`http://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_KEY}&q=${destFromForm}&aqi=yes`)
        const destinations = apiCall.data
        console.log(destinations)
        res.render("cities/results", {destinations})

    } catch(err){
        console.log((err))
    }
})





module.exports = router;
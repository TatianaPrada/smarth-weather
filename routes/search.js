const router = require("express").Router();
const axios = require("axios")

//My own middleware
const {isLoggedIn} = require("../middleware/route-guard")

//GET routes
router.get("/search", isLoggedIn, (req, res) => {
  res.render("cities/search.hbs");
});

router.get("/search/results", async (req, res) => {
    const destFromForm = req.query.destinationName;
    try{
        const apiCall = await axios(`http://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_KEY}&q=${destFromForm}&aqi=no`)
        const destinations = apiCall.data
        //console.log(destinations)
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





module.exports = router;
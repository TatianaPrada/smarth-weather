const router = require("express").Router();
const axios = require("axios")
const moment = require('moment')

//geolocation user

router.get("/", async (req, res) =>{
  let localtime = ""
  let localDate = ""
  let dayOfTheWeek = ""
  let dateString = ""
  try{
      const location = await axios("https://geolocation-db.com/json")
      console.log(location.data.city)

      const apiCall = await axios(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${location.data.city}+${location.data.country}&days=3&aqi=yes&alerts=no`)
        const cityDetails = apiCall.data
        date = cityDetails.location.localtime.split(" ")[0]
        dateString = moment(date).format("ll")
        dayOfTheWeek = moment(date).format("dddd")
        localDate = dayOfTheWeek + ","+ " " + dateString

        console.log(cityDetails)

        localtime = cityDetails.location.localtime.split(" ")[1]
        cityDetails.location.localtime = localtime
        const forecastday = apiCall.data.forecast.forecastday
        const [day1, day2, day3] = forecastday

      res.render("home", {cityDetails, dayOfTheWeek, dateString, localDate})
  } catch(err){
    console.log((err))
}
})

  
module.exports = router ;
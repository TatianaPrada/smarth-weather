const router = require("express").Router();
const axios = require("axios")
//API 
const net = require('follow-redirects').https;
const auth_key = Buffer.from(`${process.env.API_KEY}:${process.env.API_PASS}`).toString('base64');

//My own middleware
const {isLoggedIn} = require("../middleware/route-guard")

//GET routes
router.get("/search", (req, res) => {
  res.render("destinations/search.hbs");
});


// const options = {
//     'method': 'GET',
//     'hostname': 'api.roadgoat.com',
//     'port': 80,
//     'path': '/api/v2/destinations/auto_complete?q=barcelona',
//     'headers': {
//       'Authorization': `Basic ${auth_key}`
//     },
//     'maxRedirects': 20
// };


//POST route 
router.get("/search/results", async (req, res) => {
    const destFromForm = req.query.destinationName;
    console.log(destFromForm)
    try{
        const apiCall = await axios(`https://api.roadgoat.com/api/v2/destinations/auto_complete?q=${destFromForm}`,
        {headers: {'Authorization': `Basic ${auth_key}`}
    })

    const destinations = apiCall.data.data
    console.log(destinations[0].relationships.featured_photo)
    res.render("destinations/results", {info: destinations, relationships: destinations[0].relationships})
    } catch(err){
        console.log((err))
    }
})

module.exports = router;
const mongoose = require('mongoose')

const HealthFacilitySchema= new mongoose.Schema({
   
    HFName:String,
})
const HealthFacilityMondel = mongoose.model("HealthFacility" , HealthFacilitySchema)
module.exports = HealthFacilityMondel
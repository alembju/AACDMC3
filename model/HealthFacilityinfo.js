const mongoose = require('mongoose')

const HealthFacilitySchema= new mongoose.Schema({
   HRegion:String,
   HSubCity:String,
   HWoreda:String,
   HFName:String,
})
const HealthFacilityMondel = mongoose.model("HealthFacility" , HealthFacilitySchema)
module.exports = HealthFacilityMondel
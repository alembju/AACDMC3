const mongoose = require('mongoose')

const CoRegistrationSchema= new mongoose.Schema({
    NCollege:String,
    informationF:String,
    Name:String,
    Educational:String,
    Specialization:String,
    email:String,
    phone:String,
    Advisory:String,
})
const CoRegistrationMondel = mongoose.model("CoRegistration" , CoRegistrationSchema)
module.exports = CoRegistrationMondel
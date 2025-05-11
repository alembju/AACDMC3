const mongoose = require('mongoose')

const EVENTSSchema= new mongoose.Schema({
    EVENTS1:String,
    EVENTS2:String,
    EVENTS3:String,
    EVENTS1Date:Date,
    EVENTS2Date:Date,
    EVENTS3Date:Date,
})
const EVENTSMondel = mongoose.model("EVENTS" , EVENTSSchema)
module.exports = EVENTSMondel
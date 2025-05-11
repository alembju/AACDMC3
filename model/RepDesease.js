const mongoose = require('mongoose')

const RepDeseasechema= new mongoose.Schema({
    Deases:String,
    TyReport:String,
    TyChart:String,
    EPIWeek:String,
})
const RepDeseaseMondel = mongoose.model("RepDeseaseT" , RepDeseasechema)
module.exports = RepDeseaseMondel

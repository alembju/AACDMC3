const mongoose = require('mongoose')

const ResearchSchema= new mongoose.Schema({
    NCollege:String,
    Department:String,
    StudyF:String,
    Nadvisor:String,
    email:String,
    phone:String,
    PI:String,
    PIPhone:Number,
    PIemail:String,
    Title:String,
    FocusA:String,
    SPeriodB:Date,
    SPeriodE:String,
    ConductS:String,
    Rmethods:String,
    Study:String,
    Design:String,
    geographicA:String,
    Slocation:String,
    Gender:String,
    populations:String,
    MicroD:String,
    Eelectronically:String,
    Tools:String,
    Tcollection:String,
    Budget:String,
    Geocoordinate:String,
    Groups:String,
    Dsharing:String,
    Reasons:String,
    pdf: String,
},
{ collection: "Researchs" }
);  
 mongoose.model("Researchs" , ResearchSchema)
//module.exports = ResearchMondel
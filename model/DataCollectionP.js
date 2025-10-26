const mongoose = require('mongoose')

const DataCollectionPSchema= new mongoose.Schema({
   
    Name:String,
    PhonePI:String,
    email:String,
    title:String,
    NUniversity:String,
    DataC:String,
    StudyA1:String,
    NameContactP1:String,
    CPhone1:String,
    AdditionalDC:String,
    StudyA2:String,
    NameContactP2:String,
    CPhone2:String,
    Additiona3DC:String,
    StudyA3:String,
    NameContactP3:String,
    CPhone3:String,
    Additiona4DC:String,
    StudyA4:String,
    NameContactP4:String,
    CPhone4:String,
    Additiona5DC:String,
    StudyA5:String,
    NameContactP5:String,
    CPhone5:String,
    DStart:Date,
    DTermination:Date,
    
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
{ collection: "DataCollectionP" }
);

mongoose.model("DataCollectionP" , DataCollectionPSchema)
//module.exports = RegisterMondel

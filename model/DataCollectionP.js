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

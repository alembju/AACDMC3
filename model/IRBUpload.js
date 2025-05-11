const mongoose = require('mongoose')

const IRBSchema= new mongoose.Schema({
    
    NUniversity: String,
    Name: String,
    email: String,
    phone: String,
    pdf: String,
},
{ collection: "IRBUploaded" }
);

 mongoose.model("IRBUploaded" , IRBSchema)
//module.exports = IRBMondel

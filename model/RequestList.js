const mongoose = require('mongoose')

const RequestSchema= new mongoose.Schema({
    Name:String,
    phone:String,
    emaill:String,
    Title:String,
    Reaseon:String,
    Affiliation:String,
    email:String,
    messages:String,
    isCheked:String,
   
    
},
{ collection: "Requests" }
);

mongoose.model("Requests" , RequestSchema)
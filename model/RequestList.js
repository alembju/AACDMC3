const mongoose = require('mongoose')

// const RequestSchema= new mongoose.Schema({
//     Name:String,
//     phone:String,
//     emaill:String,
//     Title:String,
//     Reaseon:String,
//     Affiliation:String,
//     email:String,
//     messages:String,
//     isCheked:String,
   
    
// },
// { collection: "Requests" }
// );

// mongoose.model("Requests" , RequestSchema)


const RequestSchema = new mongoose.Schema({
   Name:String,
    phone:String,
    emaill:String,
    Title:String,
    Reaseon:String,
    Affiliation:String,
    email:String,
    messages:String,
    isCheked:String,
    public_id:String,
    url:String,
    original_filename:String, 
    format:String,
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Requests', RequestSchema);
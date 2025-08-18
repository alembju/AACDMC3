const mongoose = require("mongoose");

const Esendcehma = new mongoose.Schema({
PrincipalI: String,
Title: String,
email: String,
messages: String,
Statua: String,
filename:String,
public_id:String,
imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Esend', Esendcehma);
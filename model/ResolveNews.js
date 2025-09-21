const mongoose = require("mongoose");


const ResolveNewsScehma = new mongoose.Schema({
FrontResolveTitle: String,
FrontDate: Date,
Resolvedescription: String,
filename:String,
public_id:String,
imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('ResolveNews', ResolveNewsScehma);
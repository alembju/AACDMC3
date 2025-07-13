const mongoose = require("mongoose");

// const GuidlinesScehma = new mongoose.Schema(
//   {
//     GuidelinesTitle: String,
//     pdf: String,
//   },
//   {
//     collection: "Guidlines"
//   }
// );

// mongoose.model("Guidlines", GuidlinesScehma);

const GuidlinesScehma = new mongoose.Schema({
  GuidelinesTitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Guidlines', GuidlinesScehma);
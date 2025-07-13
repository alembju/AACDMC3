const mongoose = require("mongoose");

// const RiskAScehma = new mongoose.Schema(
//   {
//     RiskTitle: String,
//     RARegion: String,
//     SubCity: String,
//     RAKebele: String,
//     RAWoreda: String,
//     pdf: String,
//   },
//    {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// },
//   {
//     collection: "RiskA"
//   }
// );

// mongoose.model("RiskA", RiskAScehma);

const RiskAScehma = new mongoose.Schema({
  RiskTitle: String,
  RARegion: String,
  SubCity: String,
  RAKebele: String,
  RAWoreda: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('RiskA', RiskAScehma);
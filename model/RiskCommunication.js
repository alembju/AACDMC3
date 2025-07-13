const mongoose = require("mongoose");

// const RiskCommScehma = new mongoose.Schema(
//   {
//     RTitle: String,
//     Defination: String,
//     Transmition: String,
//     Prevation: String,
//     pdf: String,
//   },
//    {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// },
//   {
//     collection: "RiskCommunication"
//   }
// );

// mongoose.model("RiskCommunication", RiskCommScehma);

const RiskCommScehma = new mongoose.Schema({
  RTitle: String,
  Defination: String,
  Transmition: String,
  Prevation: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('RiskCommunication', RiskCommScehma);

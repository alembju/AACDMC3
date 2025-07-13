const mongoose = require("mongoose");

// const capacityBScehma = new mongoose.Schema(
//   {
//     TrainingTitle: String,
//     TrainingDate: String,
//     TCertification: String,
//     pdf: String,
//   },
//    {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// },
//   {
//     collection: "CapacityBuilding"
//   }
// );

// mongoose.model("CapacityBuilding", capacityBScehma);

const capacityBScehma = new mongoose.Schema({
  TrainingTitle: String,
  TrainingDate: String,
  TCertification: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('CapacityBuilding', capacityBScehma)

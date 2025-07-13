const mongoose = require("mongoose");


const ETrainingScehma = new mongoose.Schema({
  ETrainingTitle: String,
  ETrainingDate: String,
  ETrainer: String,
  EPlace: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('ETraining', ETrainingScehma);
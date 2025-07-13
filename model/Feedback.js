const mongoose = require("mongoose");

const FeedbackScehma = new mongoose.Schema({
  FeedbackTitle: String,
  FeedbackDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Feedback', FeedbackScehma);
const mongoose = require("mongoose");



const MentorshipScehma = new mongoose.Schema({
  MentorshipTitle: String,
  MentorshipDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Mentorship', MentorshipScehma);
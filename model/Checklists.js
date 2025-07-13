const mongoose = require("mongoose");

const ChecklistsScehma = new mongoose.Schema({
  ChecklistsTitle: String,
  ChecklistsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Checklists', ChecklistsScehma);
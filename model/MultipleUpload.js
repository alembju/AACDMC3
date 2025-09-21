const mongoose = require("mongoose");

const MultipleUploadScehma = new mongoose.Schema({
    NCollege: String,
   NewColl: String,
   public_id: String,
  url: String,
  original_filename: String,
  format: String,
  createdAt: { type: Date, default: Date.now }, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('MultipleUpload', MultipleUploadScehma);
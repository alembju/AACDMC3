const mongoose = require("mongoose");
const ColledgeScehma = new mongoose.Schema({
  CollName: String, 
  public_id: String,
  url: String,
  original_filename: String,
  format: String,
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Colledge', ColledgeScehma);
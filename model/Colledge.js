const mongoose = require("mongoose");
const ColledgeScehma = new mongoose.Schema({
  CollName: String, 
  pdf: String,
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Colledge', ColledgeScehma);
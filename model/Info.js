const mongoose = require("mongoose");
const InfoScehma = new mongoose.Schema({
  LatestInfo: String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Info', InfoScehma);
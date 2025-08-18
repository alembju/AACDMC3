const mongoose = require("mongoose");

const ComponentScehma = new mongoose.Schema({
 name: String,
 description: String
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Component', ComponentScehma);
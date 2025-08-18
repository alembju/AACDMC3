
const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  name: String,
  route: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Page', PageSchema);
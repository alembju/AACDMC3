const mongoose = require("mongoose");

const ReferralScehma = new mongoose.Schema({
  ReferralTitle: String,
  ReferralDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Referral', ReferralScehma);
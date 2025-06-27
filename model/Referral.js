const mongoose = require("mongoose");

const ReferralScehma = new mongoose.Schema(
  {
 
    ReferralTitle: String,
    ReferralDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Referral"
  }
);

mongoose.model("Referral",ReferralScehma);
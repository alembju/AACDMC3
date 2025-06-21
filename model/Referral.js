const mongoose = require("mongoose");

const ReferralScehma = new mongoose.Schema(
  {
 
    ReferralTitle: String,
    ReferralDate: Date,
    pdf: String,
  },
  {
    collection: "Referral"
  }
);

mongoose.model("Referral",ReferralScehma);
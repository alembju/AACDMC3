const mongoose = require("mongoose");

const IRBPolicyScehma = new mongoose.Schema(
  {
    IRBPolicyTitle: String,
    pdf: String,
  },
  {
    collection: "IRBPolicy"
  }
);

mongoose.model("IRBPolicy", IRBPolicyScehma);
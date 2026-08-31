const mongoose = require("mongoose");

const UserDetailsScehma = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    password: String,
    userType: String,
    // =====================================
    // ACCOUNT STATUS
    // =====================================

    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Disabled"],
      default: "Active",
    },
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailsScehma);
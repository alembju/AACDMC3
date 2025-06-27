const mongoose = require("mongoose");

const BulletinScehma = new mongoose.Schema(
  {
    EPIWeek: String,
    Title: String,
    BullitenDate: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Bulletin"
  }
);

mongoose.model("Bulletin", BulletinScehma);
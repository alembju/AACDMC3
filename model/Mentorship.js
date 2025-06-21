const mongoose = require("mongoose");

const MentorshipScehma = new mongoose.Schema(
  {
 
    MentorshipTitle: String,
    MentorshipDate: Date,
    pdf: String,
  },
  {
    collection: "Mentorship"
  }
);

mongoose.model("Mentorship",MentorshipScehma);
const mongoose = require("mongoose");

const MentorshipScehma = new mongoose.Schema(
  {
 
    MentorshipTitle: String,
    MentorshipDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Mentorship"
  }
);

mongoose.model("Mentorship",MentorshipScehma);
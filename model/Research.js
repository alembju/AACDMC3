const mongoose = require("mongoose");
  
const ResearchSchema = new mongoose.Schema({
  studentID: String,
    NCollege: String,
    Department: String,
    TDepartment: String,
    StudyF: String,
    TStudyF: String,
    Nadvisor: String,
    email: String,
    phone:Number,
    PI: String,
    PIPhone:Number,
    PIemail: String,
    Title: String,
     FocusA: {
    type: [String],
    default: []
  },
    TOtherFocusA: String,
    SPeriodB: Date,
    SPeriodE: Date,
    ConductS: String,
    Rmethods: String,
    Study: String,
    Design: String,
    TDesign: String,
    geographicA: String,
    TGeographicA: String,
    Slocation: String,
    Gender: String,
    TGender: String,
    populations: String,
    TOtherPopulation: String,
    MicroD: String,
    Eelectronically: String,
    Tools: String,
    TOtherTools: String,
    Tcollection: String,
    TTcollection: String,
    Budget: String,
    Geocoordinate: String,
    Groups: [String],
    TOtherGroups: String,
    Dsharing: String,
    selectedChoices: [String],
    Reasons: String,
    NewColl: String,
    public_id: String,
    url: String,
    original_filename: String,
    format: String,
    assignmentStatus: {
    type: String,
    enum: [
    "Assigned",
    "Pending",
    "underReview",
    "Accepted",
    "Rejected",
    "completed",
    "unknown"

      //  "Pending",
      // "Assigned",
      // "Under Review",
      // "Completed"
    ],
    default: "Pending"
    },

    assignedResearcherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Login",
      default: null
    },

    assignedResearcherName: {
      type: String,
      default: ""
    },

    assignedResearcherEmail: {
      type: String,
      default: ""
    },

    assignedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    studentResponseStatus: {
        type: String,
        enum: ["Not commented", "Commented"],
        default: "Not commented"
      },
      studentRespondedAt: {
        type: Date,
        default: null
      },
        createdAt: { type: Date, default: Date.now },  
    },
    {
      timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
    }
);
module.exports = mongoose.model('Researchs', ResearchSchema);
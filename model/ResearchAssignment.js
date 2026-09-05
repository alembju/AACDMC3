const mongoose = require("mongoose");

const ResearchAssignmentSchema = new mongoose.Schema(
  {
    // Research proposal
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Research",
      required: true,
    },

    // Assigned Research user
    researchUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Login",
      required: true,
    },

    researchUserFname: {
      type: String,
      required: true,
    },

    researchUserLname: {
      type: String,
      required: true,
    },

    researchUserEmail: {
      type: String,
      required: true,
    },

    // Proposal title
    title: {
      type: String,
      required: true,
    },

    // Student information
    studentId: {
      type: String,
      required: true,
    },

    studentFname: {
      type: String,
  
    },

    // Assignment status
    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Under Review",
        "Completed",
      ],
      default: "Assigned",
    },

    // Optional message
    message: {
      type: String,
      default: "",
    },

    // Assignment date
    assignedAt: {
      type: Date,
      default: Date.now,
    },

    // Completion date
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ResearchAssignmentModel =mongoose.model( "ResearchAssignment",ResearchAssignmentSchema);
  //   const ResearchAssignmentModel = mongoose.model("ResearchAssignment" , ResearchAssignmentSchema)
   module.exports = ResearchAssignmentModel

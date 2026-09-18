const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Login",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    maxOtpAttempts: {
      type: Number,
      default: 5,
    },

    resetTokenHash: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired password reset records
PasswordResetSchema.index(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// module.exports = mongoose.model(
//   "PasswordReset",
//   PasswordResetSchema

// );
  const PasswordReset =mongoose.model( "PasswordReset",  PasswordResetSchema);
    //   const ResearchAssignmentModel = mongoose.model("ResearchAssignment" , ResearchAssignmentSchema)
     module.exports = PasswordReset
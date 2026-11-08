
const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Login",
      default: null,
      index: true
    },

    username: {
      type: String,
      default: "Unknown User"
    },

    email: {
      type: String,
      default: ""
    },

    userType: {
      type: String,
      default: "Unknown"
    },

    action: {
      type: String,
      required: true,
      index: true
    },

    details: {
      type: String,
      required: true,
      default: "No additional details"
    },

    category: {
      type: String,
      enum: [
        "AUTH",
        "RESEARCH",
        "USER",
        "DOCUMENT",
        "SYSTEM",
        "OTHER"
      ],
      default: "OTHER",
      index: true
    },

    actor: String,

    ipAddress: String,
    macAddress: String,
    device: String,
    browser: String,
    operatingSystem: String,
    userAgent: String,

    description: String,

    method: String,
    endpoint: String,

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true
    },

    errorMessage: String,

    sessionId: String,

    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Dashboard indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ email: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

module.exports = AuditLog;

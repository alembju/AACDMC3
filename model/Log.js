// const mongoose = require("mongoose");

// const LogSchema = new mongoose.Schema({
// action: String,
//   user: String,
//   details: String,
//   createdAt: { type: Date, default: Date.now },
// });

// const Log = mongoose.model("Log", LogSchema);
// module.exports = Log

// ============================================================
// 1. MONGOOSE AUDIT LOG SCHEMA
// Add after importing mongoose and connecting to MongoDB.
// ============================================================
const mongoose = require("mongoose");
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null
    },

    fname: {
      type: String,
      default: ""
    },

    lname: {
      type: String,
      default: ""
    },

    actorName: {
      type: String,
      default: "Unknown user",
      index: true
    },

    email: {
      type: String,
      default: "",
      index: true
    },

    userType: {
      type: String,
      default: ""
    },

    details: String,

    // Human-readable activity, not an API route.
    action: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    // Explanation of exactly what the user did.
    details: {
      type: String,
      required: true,
      trim: true
    },

    entityType: {
      type: String,
      default: ""
    },

    entityId: {
      type: String,
      default: ""
    },

    outcome: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
      index: true
    },

    ipAddress: {
      type: String,
      default: ""
    },

    userAgent: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    collection: "auditlogs"
  }
);
auditLogSchema.index({ createdAt: -1 });

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
  module.exports = AuditLog
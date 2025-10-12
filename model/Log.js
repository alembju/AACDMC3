const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
action: String,
  user: String,
  details: String,
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", LogSchema);
module.exports = Log
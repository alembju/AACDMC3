const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
 code: { type: String, required: true, unique: true },
  name: String,
  phone: Number,
  Professional: String,
  sex: String,
  HFName: String,
  HFTName: String,
  cloudinaryUrl: String,
  qrCode: String, // base64 QR
  createdAt: { type: Date, default: Date.now },
});

const FileEntry  = mongoose.model('FileEntry', fileSchema);
module.exports = FileEntry 
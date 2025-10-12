const mongoose = require("mongoose");

const FileScehma = new mongoose.Schema({
 code: { type: String, unique: true, index: true },
  filenameOnDisk: String,
  originalName: String,
  mimeType: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date, // optional: expiry date if you want auto-delete
  downloads: { type: Number, default: 0 } // optional: download count

},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('File', FileScehma);
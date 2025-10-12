const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  name: String,
  age: Number,
  sex: String,
  code: { type: String, unique: true },
  file_public_id: String,
  file_url: String,
  uploadedAt: Date,

},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Record', RecordSchema);
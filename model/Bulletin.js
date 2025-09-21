const mongoose = require("mongoose");
const BulletinScehma = new mongoose.Schema({
  EPIWeek: String,
  Title: String,
  BullitenDate: String,
  filename: String,
  public_id: String,     
  imgUrl: String,        
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Bulletin', BulletinScehma);



// import mongoose from "mongoose";


// const fileSchema = new mongoose.Schema({
// fileName: { type: String, required: true },
// fileId: { type: String, required: true }, // imagekit fileId
// url: { type: String }, // CDN url (public) — may remain empty if private
// isPrivate: { type: Boolean, default: true },
// mimeType: { type: String },
// size: { type: Number },
// uploadedBy: { type: String, default: "anonymous" },
// createdAt: { type: Date, default: Date.now },
// });







// const mongoose = require("mongoose");

// const BulletinScehma = new mongoose.Schema({
//   EPIWeek: String,
//   Title: String,
//   BullitenDate: String,
//   // fileName: String,
//   // fileId: String,     // ImageKit fileId
//   url: String,        // not used for private
//   isPrivate: { type: Boolean, default: true },
//   // mimeType: String,
//   // size: Number,
//   // uploadedBy: { type: String, default: "anonymous" },
//   createdAt: { type: Date, default: Date.now }
// });

// const BulletinMondel = mongoose.model('Bulletin', BulletinScehma);
// module.exports = BulletinMondel
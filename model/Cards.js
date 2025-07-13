const mongoose = require("mongoose");

// const CardsScehma = new mongoose.Schema(
//   {
//     FrontTitle: String,
//     Frontdescription: String,
//     FrontDetail: String,
//     filename:String,
//     public_id:String,
//     imgUrl:String
//   },
//    {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// },
//   {
//     collection: "Cards"
//   }
// );

// mongoose.model("Cards", CardsScehma);

const CardsScehma = new mongoose.Schema({
  FrontTitle: String,
  Frontdescription: String,
  FrontDetail: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Cards', CardsScehma);
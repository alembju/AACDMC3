// const mongoose = require("mongoose");

// const Esendcehma = new mongoose.Schema({
//    userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User_Login",
//       required: true,
//     },
//      PrincipalI: {
//       type: String,
//       required: true,
//     },
// // PrincipalI: String,
// Title: String,
// email: String,
// messages: String,
// Statua: String,
// filename:String,
// public_id:String,
// imgUrl:String, 
// },
// {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// }
// );
// module.exports = mongoose.model('Esend', Esendcehma);


const mongoose = require("mongoose");

const EsendSchema =
  new mongoose.Schema(
    {

      PrincipalI_id: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "ResearchMondel",
        ref: "Researchs",
        required: true
      },

      PrincipalI: {
        type: String,
        required: true
      },

      PIemail: {
        type: String
      },

      Title: {
        type: String,
        required: true
      },
      email: {
        type : String,
        required: true
      },

      messages: {
        type: String,
        required: true
      },

      Statua: {
        type: String
      },
      filename: {
        type: String
      },

      imgUrl: {
        type: String
      },

      public_id: {
        type: String
      }
      // filename: req.file.originalname,
      // public_id: cloudinaryEsend.public_id,
      // imgUrl: cloudinaryEsend.secure_url,

    },
    {
      timestamps: true
    }
  );

const EsendModel =
  mongoose.model(
    "Esend",
    EsendSchema
  );

module.exports =
  EsendModel;






  
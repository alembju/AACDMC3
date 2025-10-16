const mongoose = require('mongoose')

// const CoRegistrationSchema= new mongoose.Schema({
//     NCollege:String,
//     informationF:String,
//     Name:String,
//     Educational:String,
//     Specialization:String,
//     email:String,
//     phone:String,
//     Advisory:String,
//     Departments:String,
//     TDepartments:String,
//     IRBPhone:String,
//     IRBEmail:String,
//     EstablishedDate:String,
//     RenewedDate:String,
//     Number:String,
//     Renewal:String,
//     Dual:String,
// })
// const CoRegistrationMondel = mongoose.model("CoRegistration" , CoRegistrationSchema)
// module.exports = CoRegistrationMondel


// const CoRegistrationSchema = new mongoose.Schema({
//    NCollege:String,
//     informationF:String,
//     Name:String,
//     Educational:String,
//     Specialization:String,
//     email:String,
//     phone:String,
//     Advisory:String,
//     Departments:String,
//     TDepartments:String,
//     IRBPhone:String,
//     IRBEmail:String,
//     EstablishedDate:String,
//     RenewedDate:String,
//     Number:String,
//     Renewal:String,
//     Dual:String,
// },
// {
//   timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
// }
// );

// module.exports = mongoose.model('CoRegistration', CoRegistrationSchema);

const CoRegistrationSchema = new mongoose.Schema(
  {
   NCollege:String,
    informationF:String,
    Name:String,
    Educational:String,
    Specialization:String,
    email:String,
    phone:String,
    Advisory:String,
    Departments:String,
    TDepartments:String,
    IRBPhone:String,
    IRBEmail:String,
    EstablishedDate:String,
    RenewedDate:String,
    Number:String,
    Renewal:String,
    Dual:String,
  },
  {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "CoRegistration"
  }
);

mongoose.model("CoRegistration", CoRegistrationSchema);
const mongoose = require('mongoose')

const SignupFormSchema= new mongoose.Schema({
   name: { type: String, required: true },
    fatherName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    birthday: { type: Date, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    
},
{ timestamps: true },
)
const SignupFormBlog = mongoose.model("SignupForm" ,SignupFormSchema)
module.exports = SignupFormBlog
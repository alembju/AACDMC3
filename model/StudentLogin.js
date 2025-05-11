const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema({
    name: { type: String, required: true },
    Lname: { type: String, required: true },
    
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    roles: { type: String, required: true },
    password: { type: String, required: true }
 },
 { collection: "StudentInfo" }
);

 const User = mongoose.model('StudentInfo', LoginSchema)

 //module.exports = User
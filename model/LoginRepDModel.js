const mongoose = require('mongoose')

const LoginRepDSchema = new mongoose.Schema({
    name: { type: String, required: true },
    Lname: { type: String, required: true },
    
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    roles: { type: String, required: true },
    password: { type: String, required: true }
 },
 { collection: "RepDUsers" }
);

const User = mongoose.model('RepDUsers', LoginRepDSchema)
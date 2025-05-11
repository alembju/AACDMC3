const mongoose = require('mongoose')

const IRBSchema = new mongoose.Schema({
    name: { type: String, required: true },
    Lname: { type: String, required: true },
    
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    roles: { type: String, required: true },
    password: { type: String, required: true }
 },
 { collection: "IRBUsers" }
);

const User = mongoose.model('IRBUsers', IRBSchema)
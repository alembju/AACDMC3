
const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
name: String,
  email: String,
  age: Number
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form
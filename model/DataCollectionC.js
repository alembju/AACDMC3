const mongoose = require("mongoose");

const DataCollectionCScehma = new mongoose.Schema({
Name: String,
PhonePI: String,
email: String,
title: String,
NUniversity: String,
Nadvisor: String,
phone: String,
PIemail: String,
Grade: String,
submitted: String,
public_id: String,
secure_url: String,
original_filename: String,
format: String,
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('DataCollectionC',DataCollectionCScehma);
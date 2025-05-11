const mongoose = require("mongoose");

const schedulemsgSchema = new mongoose.Schema({
        email:{
            type:String,
            required:true
        },
        msg:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            required:true
        }
    }
);

module.exports = mongoose.model('ScheduleMsg', schedulemsgSchema);
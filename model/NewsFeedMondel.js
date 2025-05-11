const mongoose = require('mongoose')

const NewsFeedSchema= new mongoose.Schema({
    News1:String,
    News2:String,
    News3:String,
 
})
const NewsFeedMondel = mongoose.model("NewsFeed" , NewsFeedSchema)
module.exports = NewsFeedMondel
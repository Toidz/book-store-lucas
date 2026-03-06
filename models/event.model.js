const mongoose = require("mongoose")
slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const schema = new mongoose.Schema({
    name:String,
    discount:String,
    startDate:Date,
    endDate:Date,
    information:String,
    avatar:String,
    deleted:{
        type:Boolean,
        default:false
    },
    status:String,
    slug: {   
        type: String, 
        slug: "name",
        unique: true
    },
},{
    timestamps:true
})
const Event = mongoose.model("Event",schema,"events")
module.exports = Event
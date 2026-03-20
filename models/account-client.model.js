const mongoose = require("mongoose");
slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const schema = new mongoose.Schema(
    {
        fullName:String,
        email:String,
        password:String,
        phone:String,
        city:String,
        district:String,
        ward:String,
        street:String,
        createdBy:String,
        updatedBy:String,
        deletedBy:String,
        deletedAt:Date,
        history:Array,
        slug:{
            type: String, 
            slug: "fullName",
            unique:true
        },
        deleted:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps : true
    }
);
const AccountClient = mongoose.model("AccountClient",schema,"account-client");
module.exports = AccountClient;
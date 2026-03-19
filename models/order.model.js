const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        id_user:String,
        transportCode:String,
        orderCode:String,
        fullName:String,
        phone:String,
        note:String,
        method:String,
        cart:Array,
        priceTotal:Number,
        status:String,
        payStatus:String,
        updatedBy:String,
        deletedBy:String,
        deletedAt:Date,
        checkStatus:{
            type:Boolean,
            default:false
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
const Order = mongoose.model("Order",schema,"orders");
module.exports = Order;

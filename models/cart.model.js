const mongoose = require("mongoose")
const schema = new mongoose.Schema(
    {   
        id_user:String,
        id_book:String,
        quantity:Number,
        priceLast:Number,
        checkItem:{
            type: Boolean,
            default: false
        },
        deleted:{
            type: Boolean,
            default: false
        },
        deletedBy: String,
        deletedAt: Date
    },
    {
        timestamps : true
    }
)
const Cart = mongoose.model("Cart",schema,"carts")
module.exports = Cart;
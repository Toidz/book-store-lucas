const mongoose = require("mongoose")
slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const schema = new mongoose.Schema(
    {   
        bookCode:String,
        name: String,
        category: String,
        produce: String,
        author:String,
        position: Number,
        avatar1: String,
        avatar2: String,
        avatar3: String,
        priceBook: Number,
        numberBook: Number,
        numberSale:Number,
        information:String,
        createdBy: String,
        updatedBy: String,
        slug: {   
            type: String, 
            slug: "name",
            unique: true
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
const Book = mongoose.model("Book",schema,"books")
module.exports = Book;
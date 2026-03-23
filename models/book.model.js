const mongoose = require("mongoose")
slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const schema = new mongoose.Schema(
    {   
        idEvent:String,
        bookCode:String,
        name: String,
        category: String,
        produce: String,
        author:String,
        position: Number,
        avatar: String,
        images:Array,
        priceBook: Number,
        priceSale:Number,
        numberBook: Number,
        numberSale:Number,
        information:String,
        createdBy: String,
        updatedBy: String,
        authorSlug:String, 
        slug: {   
            type: String, 
            slug: "name",
            unique: true
        },
        slugAuthor: {   
            type: String, 
            slug: "author",
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
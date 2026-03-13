const Book = require("../../models/book.model");
const Category = require("../../models/category.model")
const categoryHelper = require("../../helpers/category.helper")
const Event = require("../../models/event.model")
const moment = require("moment")
module.exports.sale = async (req, res) => {
  try {
    const slugCurrent = req.params.slug
    const event = await Event.findOne({
      slug:slugCurrent
    })
    const filterPrice = req.query.price
    const find ={
      deleted:false,
      idEvent:event.id
    }
    if(filterPrice){
        const priceCurrent = {}
        switch(parseInt(filterPrice)){
        case 0:
            priceCurrent.$lte = 50000
            break
        case 50:
            priceCurrent.$gte = 50000
            priceCurrent.$lte = 100000
            break
        case 100:
            priceCurrent.$gte = 100000
            priceCurrent.$lte = 200000
            break
        case 200:
            priceCurrent.$gte = 200000
            priceCurrent.$lte = 500000
            break
        case 500:
            priceCurrent.$gte = 500000
            priceCurrent.$lte = 1000000
            break
        case 1000:
            priceCurrent.$gte = 1000000
            break
        }
        if (Object.keys(priceCurrent).length > 0) {
            find.priceSale = priceCurrent
        } 
    }
    const sort= {}
    if(req.query.sort){
      sort.priceBook = req.query.sort
    }
    const totalBook = await Book.countDocuments(find)
    const limit =6
    const totalPage = Math.ceil(totalBook/limit)
    let page =1
    if(req.query.page>0){
      page = req.query.page
    }
    if(req.query.page>totalPage){
      page=totalPage
    }
    const skip = (page-1)*limit
    const findBook = await Book.find(find)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    for(item of findBook){
      item.eventName = event.name
      item.discount= event.discount
      item.start = moment(item.startDate).format("DD/MM/YYYY")
      item.end = moment(item.endDate).format("DD/MM/YYYY")
      item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
    }  
    res.render("client/pages/sale",{
      pageTitle:"Sách giảm giá",
      totalBook:totalBook,
      findBook:findBook,
      totalPage:totalPage,
      event:event
    });
  } catch (error) {
       res.render("client/pages/404-page")
  }
}

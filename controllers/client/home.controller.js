const categoryHelper = require("../../helpers/category.helper")
const Book = require("../../models/book.model")
const New = require("../../models/new.model.js")
const moment = require("moment")
const AccountClient = require("../../models/account-client.model")
const jwt = require("jsonwebtoken")
const Event = require("../../models/event.model.js")
module.exports.home = async (req,res) => {
  const idVn = "6825e6759800453576be8447"
  const arrayVn = await categoryHelper.categoryChild(idVn)
  const bookVn = await Book.find({
    category: {$in:arrayVn},
    deleted:false,
  })
  .limit(5)
  .sort({
    position:"desc"
  })

  const idNn = "6825e6ad9800453576be8465"
  const arrayNn = await categoryHelper.categoryChild(idNn)
  const bookNn = await Book.find({
    category: {$in:arrayNn},
    deleted:false
  })
  .limit(5)
  .sort({
    position:"desc"
  })

  const newList = await New.find({
    deleted:false
  })
  .limit(5)
  .sort({
    position:"desc"
  })
  newList.forEach(item => {
    item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY")
  });
  const bestBook = await Book.find({
    deleted:false
  })
  .limit(10)
  .sort({
    numberSale:"desc"
  })
  const newBook = await Book.find({
    deleted:false
  }).sort({createdAt:-1}).limit(10)
  for(item of bookVn){
    if(item.idEvent){
      const event = await Event.findOne({
        _id:item.idEvent
      })
      item.eventName = event.name
      item.discount= event.discount
      item.start = moment(item.startDate).format("DD/MM/YYYY")
      item.end = moment(item.endDate).format("DD/MM/YYYY")
      item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
    }
  }
  for(item of bookNn){
    if(item.idEvent){
      const event = await Event.findOne({
        _id:item.idEvent
      })
      item.eventName = event.name
      item.discount= event.discount
      item.start = moment(item.startDate).format("DD/MM/YYYY")
      item.end = moment(item.endDate).format("DD/MM/YYYY")
      item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
    }
  }
  for(item of newBook){
    if(item.idEvent){
      const event = await Event.findOne({
        _id:item.idEvent
      })
      item.eventName = event.name
      item.discount= event.discount
      item.start = moment(item.startDate).format("DD/MM/YYYY")
      item.end = moment(item.endDate).format("DD/MM/YYYY")
      item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
    }
    item.decorate="new"
  }
  for(item of bestBook){
    if(item.idEvent){
      const event = await Event.findOne({
        _id:item.idEvent
      })
      item.eventName = event.name
      item.discount= event.discount
      item.start = moment(item.startDate).format("DD/MM/YYYY")
      item.end = moment(item.endDate).format("DD/MM/YYYY")
      item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
    }
    item.decorate="hot"
  }
  const eventList = await Event.find({
    deleted:false,
    status:"active"
  })
  const token = req.cookies.tokenUser;
  if(token){
    const decoded = jwt.verify(token,process.env.JWT_SECRET_CLIENT);
    const {email} = decoded;
    const existAccount = await AccountClient.findOne({
      email:email
    })
    const historyBook = await Book.find({
      deleted:false,
      category:{$in:existAccount.history}
    }).limit(10)

    for(item of historyBook){
      if(item.idEvent){
        const event = await Event.findOne({
          _id:item.idEvent
        })
        item.eventName = event.name
        item.discount= event.discount
        item.start = moment(item.startDate).format("DD/MM/YYYY")
        item.end = moment(item.endDate).format("DD/MM/YYYY")
        item.priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(item.discount)/100 
      }
    }   
    res.render("client/pages/home",{
      pageTitle:"Trang chủ",
      bookVn:bookVn,
      bookNn:bookNn,
      newList:newList,
      bestBook:bestBook,
      historyBook:historyBook,
      newBook:newBook,
      eventList:eventList
    });
  }
  else{
    res.render("client/pages/home",{
      pageTitle:"Trang chủ",
      bookVn:bookVn,
      bookNn:bookNn,
      newList:newList,
      bestBook:bestBook,
      newBook:newBook,
      eventList:eventList
    });
  }
}
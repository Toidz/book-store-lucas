const Book = require("../../models/book.model")
const slugify = require("slugify")
const AccountClient = require("../../models/account-client.model")
const jwt = require("jsonwebtoken")
const Event = require("../../models/event.model")
const moment = require("moment")

module.exports.list = async (req,res)=>{
  const find ={
    deleted:false
  }
  const keyword = req.query.keyword
  if(keyword){
    const slug = slugify(keyword,{
      lower:true,
      locale: 'vi'
    })
    const regex = new RegExp(slug,"i")
     find.$or = [
      { slug: regex },
      { slugAuthor: regex }
    ];
  }

  const totalBook = await Book.countDocuments(find)
  const limit =9
  const totalPage = Math.ceil(totalBook/limit)
  let page =1
  if(req.query.page>0){
    page = req.query.page
  }
  if(req.query.page>totalPage){
    page=totalPage
  }
  const skip = (page-1)*limit

  const listBook = await Book
  .find(find)
  .skip(skip)
  .limit(limit)
  for(item of listBook){
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
  const historyBook = []
  listBook.forEach(item=>{
    historyBook.push(item.category)
  })
  const token = req.cookies.tokenUser;
  if(token){
    const decoded = jwt.verify(token,process.env.JWT_SECRET_CLIENT);
    const {email} = decoded;
    const existAccount = await AccountClient.findOne({
      email:email
    })
    await AccountClient.updateOne({
      deleted:false,
      _id:existAccount.id
    },{
      history:historyBook
    })
  }
  res.render("client/pages/search",{
    pageTitle:"Kết quả tìm kiếm",
    listBook:listBook,
    totalBook:totalBook,
    totalPage:totalPage
  })
}
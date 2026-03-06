const jwt = require("jsonwebtoken")
const Book = require("../../models/book.model");
const Category = require("../../models/category.model")
const categoryHelper = require("../../helpers/category.helper")
const AccountClient = require("../../models/account-client.model")
const Event = require("../../models/event.model")
const moment = require("moment")
module.exports.book = async (req, res) => {
  const slugCurrent = req.params.slug
  const dataCategory = await Category.findOne({
    slug:slugCurrent
  })
  let breadList = []
  if(dataCategory.parent){
    const bread = await categoryHelper.categoryParent(dataCategory.parent)
    if(bread.length >0){
      breadList = await Category.find({
      _id:{$in:bread}
    })
    }
  }
  const arrayId = await categoryHelper.categoryChild(dataCategory.id)
  const find ={
    deleted:false,
    category : {$in:arrayId}
  }
  
  const filterChild = await Category.find({
    _id:{$in:arrayId}
  })
  const filterChildTree = categoryHelper.categoryTree(filterChild,dataCategory.parent)
  const filterPrice = req.query.price
  if(filterPrice){
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
          break
      }
      if (Object.keys(priceCurrent).length > 0) {
        find.priceBook = priceCurrent
      }       
    } 
  }
  const sort= {}
  if(req.query.sort){
    sort.priceBook = req.query.sort
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

  const allBook = await Book
  .find(find)
  .sort(sort)
  .skip(skip)
  .limit(limit)
  for(item of allBook){
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
  res.render("client/pages/book",{
    pageTitle:"Danh sách sách",
    dataCategory:dataCategory,
    filterChild:filterChildTree,
    totalBook:totalBook,
    allBook:allBook,
    breadList:breadList,
    totalPage:totalPage
  });
}

module.exports.detail = async (req,res) =>{
  const slug = req.params.slug
  const book = await Book.findOne({
    slug:slug,
    deleted:false,
  })
  if(book){
    const category = await Category.findOne({
      _id:book.category
    })
    const bread ={
      title:book.name,
      image:book.avatar1,
      desc:book.information,
      list:[
        {
        link:"/",
        name:"Trang chủ"
      }]
    }

    if(category.parent){
      const parent = await Category.findOne({
        _id:category.parent
      })
      bread.list.push({
        link:`/book/${parent.slug}`,
        name:parent.name
      })
    }
    bread.list.push({
      link:`/book/${category.slug}`,
      name:category.name
    })
    bread.list.push({
      link:`/book/detail/${book.slug}`,
      name:book.name
    })
    let id_user = "";
    const token = req.cookies.tokenUser;
     if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_CLIENT);
        const existAccount = await AccountClient.findOne({ email: decoded.email });
        if (existAccount) {
          id_user = existAccount.id;
        }
      } catch (error) {
      }
    }
    if(book.idEvent){
      const event = await Event.findOne({
        _id:book.idEvent
      })
      book.eventName = event.name
      book.discount= event.discount
      book.start = moment(book.startDate).format("DD/MM/YYYY")
      book.end = moment(book.endDate).format("DD/MM/YYYY")
      book.priceLast = parseInt(book.priceBook)-parseInt(book.priceBook)*parseInt(book.discount)/100 
    }
    
    res.render("client/pages/book-detail",{
      pageTitle:"Chi tiết sách",
      category:category,
      bread:bread,
      book:book,
      id_user:id_user
    });
  }
  else{
    res.redirect("/")
  }
}

const jwt = require("jsonwebtoken")
const Book = require("../../models/book.model");
const Category = require("../../models/category.model")
const categoryHelper = require("../../helpers/category.helper")
const AccountClient = require("../../models/account-client.model")
const Event = require("../../models/event.model")
const Order = require("../../models/order.model")
const Comment = require("../../models/comment.model")
const moment = require("moment")
module.exports.book = async (req, res) => {
  try {
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
    }
    const sort= {}
    if(req.query.sort){
      sort.priceSale = req.query.sort
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
  } catch (error) {
       res.render("client/pages/404-page")
  }
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
    let canComment = false;
    let canCommentMessage = "Bạn chưa đủ điều kiện để bình luận sách này.";
    const token = req.cookies.tokenUser;
     if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_CLIENT);
        const existAccount = await AccountClient.findOne({ email: decoded.email });
        if (existAccount) {
          id_user = existAccount.id;
          const orderList = await Order.find({
            id_user: id_user,
            deleted: false,
            status: "done"
          });
          const existComment = await Comment.findOne({
            id_book: book.id,
            id_user: id_user,
            deleted: false
          });
          if(existComment){
            canComment = false;
            canCommentMessage = "Bạn đã bình luận sách này rồi.";
          }
          const now = new Date();
          if(!existComment){
            for (const order of orderList) {
              const hasBook = (order.cart || []).some(item => item.id_book == book.id);
              if(!hasBook) continue;
              const doneAt = moment(order.updatedAt).toDate();
              const expiredAt = moment(order.updatedAt).add(7, "days").toDate();
              if(now >= doneAt && now <= expiredAt){
                canComment = true;
                break;
              }
            }
            if(!canComment){
              canCommentMessage = "Bạn chỉ được bình luận trong vòng 7 ngày kể từ khi đơn hàng chuyển sang đã giao.";
            }
          }
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
    
    const commentList = await Comment.find({
      id_book: book.id,
      deleted: false,
      status: "approved"
    }).sort({
      createdAt: "desc"
    });
    for(const comment of commentList){
      const accountComment = await AccountClient.findOne({
        _id: comment.id_user
      });
      comment.fullName = accountComment ? accountComment.fullName : "Khách hàng";
      comment.formatCreatedAt = moment(comment.createdAt).format("HH:mm - DD/MM/YYYY");
    }
    
    res.render("client/pages/book-detail",{
      pageTitle:"Chi tiết sách",
      category:category,
      bread:bread,
      book:book,
      id_user:id_user,
      canComment:canComment,
      canCommentMessage:canCommentMessage,
      commentList:commentList
    });
  }
  else{
    res.redirect("/")
  }
}

module.exports.commentPost = async (req,res) =>{
  try {
    const { idBook } = req.params;
    const { content } = req.body;
    if(!content || !content.trim()){
      return res.json({
        code:"error",
        message:"Nội dung bình luận không được để trống!"
      });
    }

    const token = req.cookies.tokenUser;
    if(!token){
      return res.json({
        code:"error",
        message:"Vui lòng đăng nhập để bình luận!"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_CLIENT);
    const existAccount = await AccountClient.findOne({
      email: decoded.email
    });
    if(!existAccount){
      return res.json({
        code:"error",
        message:"Tài khoản không hợp lệ!"
      });
    }

    const orderList = await Order.find({
      id_user: existAccount.id,
      deleted: false,
      status: "done"
    });
    const existComment = await Comment.findOne({
      id_book: idBook,
      id_user: existAccount.id,
      deleted: false
    });
    if(existComment){
      return res.json({
        code:"error",
        message:"Bạn đã bình luận sách này rồi!"
      });
    }
    let allowComment = false;
    let idOrder = "";
    const now = new Date();
    for (const order of orderList) {
      const hasBook = (order.cart || []).some(item => item.id_book == idBook);
      if(!hasBook) continue;
      const doneAt = moment(order.updatedAt).toDate();
      const expiredAt = moment(order.updatedAt).add(7, "days").toDate();
      if(now >= doneAt && now <= expiredAt){
        allowComment = true;
        idOrder = order.id;
        break;
      }
    }
    if(!allowComment){
      return res.json({
        code:"error",
        message:"Bạn chỉ được bình luận trong vòng 7 ngày kể từ khi đơn hàng chuyển sang đã giao!"
      });
    }

    const dataFinal = new Comment({
      id_book: idBook,
      id_user: existAccount.id,
      id_order: idOrder,
      content: content.trim(),
      status: "pending"
    });
    await dataFinal.save();
    return res.json({
      code:"success",
      message:"Đã gửi bình luận, vui lòng chờ duyệt."
    });
  } catch (error) {
    return res.json({
      code:"error",
      message:"Gửi bình luận thất bại!"
    });
  }
}

module.exports.commentEditPatch = async (req,res) =>{
  try {
    const { idComment } = req.params;
    const { content } = req.body;
    if(!content || !content.trim()){
      return res.json({
        code:"error",
        message:"Nội dung bình luận không được để trống!"
      });
    }

    const token = req.cookies.tokenUser;
    if(!token){
      return res.json({
        code:"error",
        message:"Vui lòng đăng nhập!"
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_CLIENT);
    const existAccount = await AccountClient.findOne({
      email: decoded.email
    });
    if(!existAccount){
      return res.json({
        code:"error",
        message:"Tài khoản không hợp lệ!"
      });
    }

    const commentCurrent = await Comment.findOne({
      _id:idComment,
      id_user: existAccount.id,
      deleted:false
    });
    if(!commentCurrent){
      return res.json({
        code:"error",
        message:"Không tìm thấy bình luận!"
      });
    }
    if(commentCurrent.status == "approved"){
      return res.json({
        code:"error",
        message:"Bình luận đã duyệt không thể chỉnh sửa!"
      });
    }

    await Comment.updateOne({
      _id:idComment
    },{
      content: content.trim()
    });

    return res.json({
      code:"success",
      message:"Cập nhật bình luận thành công!"
    });
  } catch (error) {
    return res.json({
      code:"error",
      message:"Sửa bình luận thất bại!"
    });
  }
}

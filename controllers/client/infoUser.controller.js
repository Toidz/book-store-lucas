const jwt = require("jsonwebtoken")
const addressConfig = require("../../config/address")
const AccountClient = require("../../models/account-client.model")
const AddressClient = require("../../models/address.model")
const Comment = require("../../models/comment.model")
const Book = require("../../models/book.model")
const moment = require("moment")
module.exports.getInfoUser = async (req,res)=>{
    try {
        const city=[]
        const addressList = addressConfig.address;
        addressList.forEach(item => {
            city.push(item.name)
        });
        const token = req.cookies.tokenUser;
        if(!token){
            res.redirect(`/account/login`);
            return;
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_CLIENT);
        const {email} = decoded;
        const existAccount = await AccountClient.findOne({
            email:email
        })
        const address =
        (existAccount.street ? existAccount.street : "") +
        (existAccount.ward ? ", " + existAccount.ward : "") +
        (existAccount.district ? ", " + existAccount.district : "") +
        (existAccount.city ? ", " + existAccount.city : "");
   
        res.render("client/pages/infoUser",{
            pageTitle:"Trang thông tin tài khoản",
            existAccount:existAccount,
            city:city,
            address:address
        
        });
    } catch (error) {
        res.redirect(`/account/login`);
    }
}
module.exports.postInfoUser = async (req,res)=>{
    const {fullName,phone,id,city,district,ward,street} = req.body;
    const existAccount = await AccountClient.findOne({
        _id:id
    })
    if(!existAccount){
        res.json({
            code:"error",
            message:"Tài khoản không tồn tại trong hệ thống!"
        })
        return;
    }
    await AccountClient.updateOne({
        _id:id,
        deleted:false
    },{
        fullName:fullName,
        phone:phone,
        city:city,
        district:district,
        ward:ward,
        street:street
    })
    const existAddress = await AddressClient.findOne({
        user_id:id
    })
    if(existAddress){
        await AddressClient.updateOne({
            user_id:id
        },{
            name:fullName,
            phone:phone,
            city:city,
            district:district,
            ward:ward,
            street:street
        })
    }
    else{
        const address = new AddressClient({
            user_id:id,
            name:fullName,
            phone:phone,
            city:city,
            district:district,
            ward:ward,
            street:street
        })
        await address.save()
    }
    
    req.flash("success","Cập nhật thông tin thành công!")
    res.json({
        code:"success"
    })
}

module.exports.myComments = async (req,res)=>{
    const find = {
        id_user: req.account.id,
        deleted:false
    }
    const commentList = await Comment.find(find).sort({
        createdAt:"desc"
    })
    for(const item of commentList){
        const book = await Book.findOne({
            _id:item.id_book
        })
        item.bookName = book ? book.name : "Sách đã xóa"
        item.bookSlug = book ? book.slug : ""
        item.formatCreatedAt = moment(item.createdAt).format("HH:mm - DD/MM/YYYY")
        item.statusLabel = item.status == "approved" ? "Đã duyệt" : "Chờ duyệt"
    }
    res.render("client/pages/my-comments",{
        pageTitle:"Bình luận của tôi",
        commentList:commentList
    })
}

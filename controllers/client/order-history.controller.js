const Order = require("../../models/order.model")
const variable = require("../../config/variable")
const Book = require("../../models/book.model")
const moment = require("moment")
module.exports.list = async (req,res)=>{
    let keyword = "";
    if(req.query.keyword){
        keyword = req.query.keyword
    }
    const dataFind ={
        deleted:false,
        id_user:req.account.id,
    }
    if (keyword) {
        dataFind.$or = [
            { orderCode: { $regex: keyword, $options: "i" } }, 
            { "cart.name": { $regex: keyword, $options: "i" } }, 
        ];
    }

    const totalOrder = await Order.countDocuments(dataFind)
    const limit =4
    const totalPage = Math.ceil(totalOrder/limit)
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }
    if(req.query.page>totalPage){
        page=totalPage
    }
    const skip = (page-1)*limit
    const listOrder = await Order.find(dataFind) 
    .skip(skip)
    .limit(limit)
    .sort({
        createdAt:"desc"
    })
    for (const item of listOrder) {
        item.cartLength = item.cart.length;
    }
    res.render("client/pages/order-history",{
        pageTitle:"Lịch sử đơn hàng",
        listOrder:listOrder,
        totalOrder:totalOrder,
        totalPage:totalPage
    })
}
module.exports.detail = async (req,res)=>{
    try {
        const orderId = req.query.orderId
        const id_user = req.account.id
        const find ={
            deleted:false
        }
        if(id_user){
            find.id_user = id_user
        }
        if(orderId){
            find._id=orderId
        }
        const order = await Order.findOne(find)
        const method = variable.method.find(item => item.value == order.method);
        order.methodName = method ? method.lable : "";
    
        const payStatus = variable.payStatus.find(item => item.value == order.payStatus);
        order.payStatusName = payStatus ? payStatus.lable : "";
    
        const status = variable.status.find(item => item.value == order.status);
        order.statusName = status ? status.lable : "";
        let fee = 0;
        if(!order.note.includes("Hà Nội")) fee=30000
    
        order.createdAtFormat = moment(order.createdAt).format("HH:mm - DD/MM/YYYY");
        res.render("client/pages/order-success",{
            pageTitle:"Chi tiết đơn hàng",
            order:order,
            fee:fee
        })
    } catch (error) {
        res.render("client/pages/404-page")
    }
}
module.exports.cancel = async (req,res)=>{
    try {
        const orderId = req.params.id
        const orderFind = await Order.findOne({
            _id:orderId,
            deleted:false
        })
        if(orderFind && orderFind.status === "initial"){
            for (const item of orderFind.cart) {
                const bookDetail = await Book.findOne({
                    _id:item.id_book,
                    deleted:false
                })
                if(bookDetail){
                    await Book.updateOne({
                        _id:item.id_book,
                        deleted:false
                    },{
                        numberBook:parseInt(bookDetail.numberBook)+parseInt(item.quantity)
                    })
                }         
            }
            await Order.updateOne({
                _id:orderId,
                deleted:false,
                payStatus:"unpaid"
            },{
                    deleted:true,
                    deletedAt:Date.now(),
                    deletedBy:req.account.id
            })
        }
        else{
            res.json({
                code:"error",
                message:"Đơn hàng không thể hủy!"    
            })
            return;
        }
        
        res.json({
            code:"success",
            message:"Hủy đơn hàng thành công!"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Hủy đơn hàng thất bại!"
        })
    }
}
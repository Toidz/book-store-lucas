const Order = require("../../models/order.model")
const variable = require("../../config/variable")
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

    const listOrder = await Order.find(dataFind)
    for (const item of listOrder) {
        item.cartLength = item.cart.length;
    }
    res.render("client/pages/order-history",{
        pageTitle:"Trang lịch sử đơn hàng",
        listOrder:listOrder
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
            pageTitle:"Thông tin đơn hàng",
            order:order,
            fee:fee
        })
    } catch (error) {
        res.render("client/pages/404-page")
    }
}
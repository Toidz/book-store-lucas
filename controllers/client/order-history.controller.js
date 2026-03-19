const Order = require("../../models/order.model")
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
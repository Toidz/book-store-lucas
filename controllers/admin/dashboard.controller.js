const AccountAdmin = require("../../models/account-admin.model")
const Order = require("../../models/order.model")
const variable = require("../../config/variable")
const moment = require("moment")
const Book = require("../../models/book.model")
const Event = require("../../models/event.model")
module.exports.dashboard =  async (req,res)=>{
    const dashboard ={
        account:0,
        order:0,
        totalPrice:0
    }
    const account = await AccountAdmin.countDocuments({
        status:"active"
    })
    if(account) dashboard.account = account

    const order = await Order.find({
        deleted:false
    })
    if(order) dashboard.order= order.length

    const orderPay = await Order.find({
        deleted:false,
        payStatus:"paid"
    })
    const totalPrice =  orderPay.reduce((sum,item)=>{
        return sum + item.priceTotal
    },0)
    if(totalPrice) dashboard.priceTotal = totalPrice

    const orderNew  = await Order.find({
        deleted:"false"
    })
    .limit(3)
    .sort({
        createdAt:"desc"
    })
    for(let order of orderNew){
       order.valueMethod= variable.method.find(item => item.value==order.method)
       order.valueStatusPay = variable.payStatus.find(item => item.value==order.payStatus)
       order.nameMethod=order.valueMethod.lable
       order.nameStatusPay =order.valueStatusPay.lable
       order.formatTime = moment(order.createdAt).format("HH:mm")
       order.formatDay = moment(order.createdAt).format("DD/MM/YYYY")
    
    }
    
    res.render("admin/pages/dashboard",{
        pageTitle:"Trang tổng quan",
        dashboard:dashboard,
        orderNew:orderNew
    })
}

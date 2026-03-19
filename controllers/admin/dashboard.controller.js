const AccountAdmin = require("../../models/account-admin.model")
const Order = require("../../models/order.model")
const variable = require("../../config/variable")
const moment = require("moment")
const Category = require("../../models/category.model")
const Book = require("../../models/book.model")
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
    const categoryList = await Category.find({
        parent:"",
        deleted:false
    })
    let almostOver =0
    let many=0
    let soldOut=0
    let totalBook = 0
    const bookList = await Book.find({
        deleted:false
    })

    for(let item of bookList){
        if(item.numberBook<=15&&item.numberBook>0){
            almostOver++;
        }
        if(item.numberBook>15){
            many++;
        }
        if(item.numberBook==0) {
            soldOut++;
        }
        totalBook+=item.numberBook
    }

    const listBook = await Book.find({
        deleted:false,
        numberSale:{$gt:0}
    })

    const allOrder = await Order.find({
        deleted:false, 
        payStatus:"paid"
    })
    for(let b of listBook){
        b.sold=0
        for (let order of allOrder) {
            if (order.payStatus == "paid") {
                for (let item of order.cart) {
                    if (item.id_book==b.id) {
                        b.sold += item.quantity;
                    }
                }
            }
        }
    }
  
    const topBook = listBook.sort((a, b) => b.sold - a.sold).slice(0, 5);
    res.render("admin/pages/dashboard",{
        pageTitle:"Trang tổng quan",
        dashboard:dashboard,
        orderNew:orderNew,
        categoryList:categoryList,
        almostOver:almostOver,
        many:many,
        soldOut:soldOut,
        topBook:topBook,
        totalBook:totalBook
    })
}
module.exports.revenueChart =  async (req,res)=>{
    const {
        currentMonth,
        currentYear,
        previousMonth,
        previousYear,
        arrayDay
    } = req.body
    const orderCurrent = await Order.find({
        deleted:false,
        createdAt:{
            $gte:new Date(currentYear,currentMonth-1,1),
            $lte:new Date(currentYear,currentMonth,1),
        }
    })
    const orderPrevious = await Order.find({
        deleted:false,
        createdAt:{
            $gte:new Date(previousYear,previousMonth-1,1),
            $lte:new Date(previousYear,previousMonth,1),
        }
    })
    const dataMonthCurrent = []
    const dataMonthPrevious = []
    for (const day of arrayDay) {
        let total =0
        for (const item of orderCurrent) {
            const orderDate = new Date(item.createdAt).getDate()
            if(day==orderDate&&item.payStatus=="paid"){
                total += item.priceTotal
            }
        }
        dataMonthCurrent.push(total)
    }
    for (const day of arrayDay) {
        let total =0
        for (const item of orderPrevious) {
            const orderDate = new Date(item.createdAt).getDate()
            if(day==orderDate&&item.payStatus=="paid"){
                total += item.priceTotal
            }
        }
        dataMonthPrevious.push(total)
    }
    res.json({
        code:"success",
        dataMonthCurrent:dataMonthCurrent,
        dataMonthPrevious:dataMonthPrevious
    })
}
module.exports.inventory = async (req,res)=>{
    try {
        const categoryCurrent = req.query.category
        const result =[]
        const categoryChildList = await Category.find({
            deleted:false,
            parent:categoryCurrent
        })
        const idcates =[]
        for(let item of categoryChildList){
            idcates.push(item.id)
            result.push({
                id:item.id,
                name:item.name,
                count:0,
                child:[]
            })
        }
        const categoryChildLast = await Category.find({
            deleted:false,
            parent:{$in:idcates}
        })
        for(let item of categoryChildLast){
            for(let it of result){
                if(item.parent==it.id){
                    it.child.push({
                        id_child:item.id
                    })
                }
            }
        }
        const bookList = await Book.find({
            deleted:false
        })
        for(let item of bookList){
            for(let it of result){
                for(let i of it.child){    
                    if(item.category==i.id_child) it.count+=(parseInt(item.numberBook?item.numberBook:0))       
                }
            }
        }
        res.json({
            result:result
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

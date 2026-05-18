const AccountAdmin = require("../../models/account-admin.model")
const AccountClient = require("../../models/account-client.model")
const Order = require("../../models/order.model")
const variable = require("../../config/variable")
const moment = require("moment")
const Category = require("../../models/category.model")
const Book = require("../../models/book.model")
module.exports.dashboard = async (req, res) => {
    let { dateFrom, dateTo } = req.query;
    if (!dateFrom || !dateTo) {
        dateTo = moment().format("YYYY-MM-DD");
        dateFrom = moment().subtract(30, 'days').format("YYYY-MM-DD");
    }
    const dateQueryCondition = {
        $gte: moment(dateFrom).startOf('day').toDate(),
        $lte: moment(dateTo).endOf('day').toDate()
    };
    const dashboard = {
        account: 0,
        order: 0,
        priceTotal: 0
    };
    const account = await AccountAdmin.countDocuments({ status: "active" });
    if (account) dashboard.account = account;
    const order = await Order.find({
        deleted: false,
        createdAt: dateQueryCondition
    });
    if (order) dashboard.order = order.length;
    const orderPay = await Order.find({
        deleted: false,
        payStatus: "paid",
        createdAt: dateQueryCondition
    });
    const totalPrice = orderPay.reduce((sum, item) => sum + item.priceTotal, 0);
    dashboard.priceTotal = totalPrice;
    const orderNew = await Order.find({
        deleted: false,
        createdAt: dateQueryCondition
    })
    .limit(3)
    .sort({ createdAt: "desc" });

    for (let order of orderNew) {
        order.valueMethod = variable.method.find(item => item.value == order.method);
        order.valueStatusPay = variable.payStatus.find(item => item.value == order.payStatus);
        order.nameMethod = order.valueMethod ? order.valueMethod.lable : "";
        order.nameStatusPay = order.valueStatusPay ? order.valueStatusPay.lable : "";
        order.formatTime = moment(order.createdAt).format("HH:mm");
        order.formatDay = moment(order.createdAt).format("DD/MM/YYYY");
    }
    const categoryList = await Category.find({ parent: "", deleted: false });
    const bookList = await Book.find({
        deleted: false
    });
    let almostOver = 0, many = 0, soldOut = 0, totalBook = 0;
    for (let item of bookList) {
        if (item.numberBook <= 15 && item.numberBook > 0) almostOver++;
        if (item.numberBook > 15) many++;
        if (item.numberBook == 0) soldOut++;
        totalBook += item.numberBook;
    }
    const listBook = await Book.find({ deleted: false });
    for (let b of listBook) {
        b.sold = 0;
        b.profit = 0;
        for (let order of orderPay) {
            for (let item of order.cart) {
                if (item.id_book == b.id) {
                    b.sold += item.quantity;
                    b.profit += (item.priceLast * item.quantity);
                }
            }
        }
    }
    const topBook = listBook
        .filter(b => b.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
    res.render("admin/pages/dashboard", {
        pageTitle: "Trang tổng quan",
        dashboard: dashboard,
        orderNew: orderNew,
        categoryList: categoryList,
        almostOver: almostOver,
        many: many,
        soldOut: soldOut,
        topBook: topBook,
        totalBook: totalBook,
        dateFromSelected: dateFrom,
        dateToSelected: dateTo
    });
};
module.exports.revenueChart = async (req, res) => {
    try {
        const { dateFrom, dateTo, arrayDay } = req.body;
        if (!dateFrom || !dateTo || !arrayDay) {
            return res.json({ code: "error", message: "Thiếu tham số dữ liệu dải ngày!" });
        }
        const orders = await Order.find({
            deleted: false,
            payStatus: "paid",
            createdAt: {
                $gte: moment(dateFrom).startOf('day').toDate(),
                $lte: moment(dateTo).endOf('day').toDate()
            }
        });
        const dataMonthCurrent = [];
        for (const dayLabel of arrayDay) {
            let total = 0;
            for (const item of orders) {
                const orderDateLabel = moment(item.createdAt).format("DD/MM");
                if (dayLabel === orderDateLabel) {
                    total += item.priceTotal;
                }
            }
            dataMonthCurrent.push(total);
        }
        res.json({
            code: "success",
            dataMonthCurrent: dataMonthCurrent
        });
    } catch (error) {
        console.error("Lỗi tại revenueChart API:", error);
        res.json({ code: "error", message: "Có lỗi xảy ra tại hệ thống server!" });
    }
};
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

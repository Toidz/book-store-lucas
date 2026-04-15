const Order = require("../../models/order.model")
const Book = require("../../models/book.model")
const variable = require("../../config/variable")
const moment = require("moment")
const ExcelJS = require("exceljs")

const buildOrderFilter = (query) => {
    const find = {
        deleted:false
    }
    if(query.status){
        find.status = query.status
    }
    const filterDate ={}
    if(query.startDate){
        filterDate.$gte = moment(query.startDate).startOf("date").toDate()
    }
    if(query.endDate){
        filterDate.$lte = moment(query.endDate).endOf("date").toDate()
    }
    if(Object.keys(filterDate).length>0){
        find.createdAt = filterDate
    }
    if(query.method){
        find.method = query.method
    }
    if(query.statusPay){
        find.payStatus = query.statusPay
    }
    if(query.keyword){
        const regex = new RegExp(query.keyword,"i")
        find.orderCode = regex
    }
    return find
}

const mapOrderDisplayFields = (orderList) => {
    orderList.forEach(order => {
       order.valueMethod = variable.method.find(item => item.value==order.method)
       order.valueStatusPay = variable.payStatus.find(item => item.value==order.payStatus)
       order.valueStatus = variable.status.find(item => item.value==order.status)
       order.nameMethod=order.valueMethod? order.valueMethod.lable :""
       order.nameStatusPay =order.valueStatusPay? order.valueStatusPay.lable :""
       order.nameStatus =order.valueStatus? order.valueStatus.lable :""
       order.time = moment(order.createdAt).format("HH:mm")
       order.day = moment(order.createdAt).format("DD/MM/YYYY")
    });
}
module.exports.edit = async (req,res)=>{
    const orderCode = req.params.code
    const orderCurrent = await Order.findOne({
        deleted:false,
        orderCode:orderCode
    })
    if(orderCurrent.createdAt)orderCurrent.createdAtFormat = moment(orderCurrent.createdAt).format("YYYY-MM-DDTHH:mm")
    res.render("admin/pages/order-edit",{
        pageTitle:`Đơn hàng: ${orderCode}`,
        orderCurrent:orderCurrent

    })
}
module.exports.editPatch = async (req,res)=>{
    try {
        const orderCode = req.params.code
        const status= req.body.payStatus
        if(status=="paid"){
            const orderCurrent = await Order.findOne({
                orderCode:orderCode,
                checkStatus:false
            })
            if(orderCurrent){
                for(let it of orderCurrent.cart){
                    await Book.updateOne({
                        _id:it.id_book,
                    },{
                        $inc:{
                            numberSale:parseInt(it.quantity)
                        }
                    })
                } 
                await Order.updateOne({
                    orderCode:orderCode
                },{
                    checkStatus:true
                })   
            }
        }
        await Order.updateOne({
            orderCode:orderCode
        },req.body)
        
        req.flash("success","Cập nhật thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật thất bại!"
        })
    }
}
module.exports.list = async (req,res)=>{
    const find = buildOrderFilter(req.query)
    const totalOrder = await Order.countDocuments(find)
    const limit = 4
    const totalPage= Math.ceil(totalOrder/limit)
    let page =1
    if(req.query.page>0){
        page = parseInt(req.query.page)
    }
    if(req.query.page>totalPage&&totalPage>0){
        page = parseInt(totalPage)
    }
    const skip = limit*(page-1)
    const pagination ={
        totalPage:totalPage,
        totalOrder:totalOrder,
        skip:skip
    }
    const orderList = await Order
    .find(find)
    .sort({
        createdAt:"desc"
    })
    .limit(limit)
    .skip(skip)
    mapOrderDisplayFields(orderList)

    res.render("admin/pages/order-list",{
        pageTitle:"Quản lý đơn hàng",
        orderList:orderList,
        pagination:pagination,
        queryCurrent:req.query
    })
}

module.exports.exportExcel = async (req,res)=>{
    try {
        const find = buildOrderFilter(req.query)
        const orderList = await Order.find(find).sort({
            createdAt:"desc"
        }).lean()
        mapOrderDisplayFields(orderList)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Don_hang")
        worksheet.columns = [
            { header: "Mã đơn", key: "orderCode", width: 20 },
            { header: "Họ tên", key: "fullName", width: 25 },
            { header: "Số điện thoại", key: "phone", width: 18 },
            { header: "Địa chỉ nhận hàng", key: "note", width: 45 },
            { header: "Phương thức thanh toán", key: "method", width: 22 },
            { header: "Trạng thái thanh toán", key: "payStatus", width: 20 },
            { header: "Trạng thái đơn hàng", key: "status", width: 22 },
            { header: "Sản phẩm", key: "products", width: 60 },
            { header: "Tổng tiền (VND)", key: "priceTotal", width: 20 },
            { header: "Ngày đặt", key: "createdAt", width: 20 },
        ]

        orderList.forEach(order => {
            const products = (order.cart || []).map(item => `${item.name} x${item.quantity}`).join("; ")
            worksheet.addRow({
                orderCode: order.orderCode || "",
                fullName: order.fullName || "",
                phone: order.phone || "",
                note: order.note || "",
                method: order.nameMethod || "",
                payStatus: order.nameStatusPay || "",
                status: order.nameStatus || "",
                products: products,
                priceTotal: order.priceTotal || 0,
                createdAt: moment(order.createdAt).format("DD/MM/YYYY HH:mm"),
            })
        })

        worksheet.getRow(1).font = { bold: true }
        worksheet.views = [{ state: "frozen", ySplit: 1 }]

        const fileName = `don-hang-${moment().format("YYYYMMDD-HHmmss")}.xlsx`
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        req.flash("error","Xuất file Excel thất bại!")
        res.redirect("list")
    }
}
module.exports.deletePatch = async (req,res)=>{
    try {
        const orderCode = req.params.code

        const orderFind = await Order.findOne({
            orderCode:orderCode,
            deleted:false
        })
        if(orderFind){
            for (const item of orderFind.cart) {
                const bookDetail = await Book.findOne({
                    _id:item.id_book,
                    deleted:false,
                    $or: [
                        { numberSale: 0 },
                        { numberSale: { $exists: false } }
                    ]
                })

                if(bookDetail){
                    await Book.updateOne({
                        _id:item.id_book,
                        deleted:false
                    },{
                        numberBook:parseInt(bookDetail.numberBook)+parseInt(item.quantity)
                    })
                }
                else{
                    const bookDetail1 = await Book.findOne({
                        _id:item.id_book,
                        deleted:false,
                        numberSale:{$gt:0}
                    })

                    if(bookDetail1){
                        await Book.updateOne({
                            _id:item.id_book,
                            deleted:false
                        },{
                            numberBook:parseInt(bookDetail1.numberBook)+parseInt(item.quantity),
                            numberSale:parseInt(bookDetail1.numberSale)-parseInt(item.quantity)
                        })
                    }    
                }
                 
            }
        }
        await Order.updateOne({
            orderCode:orderCode
        },{
            deleted:true,
            deletedAt:Date.now(),
            deletedBy: req.account.id,
        })
        
        req.flash("success","Xóa đơn hàng thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa đơn hàng thất bại!"
        })
    }
}
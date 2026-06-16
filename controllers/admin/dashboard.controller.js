const AccountAdmin = require("../../models/account-admin.model")
const AccountClient = require("../../models/account-client.model")
const Order = require("../../models/order.model")
const variable = require("../../config/variable")
const moment = require("moment")
const Category = require("../../models/category.model")
const Book = require("../../models/book.model")
const ExcelJS = require("exceljs");
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
    .limit(10)
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
        .slice(0, 10);
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

module.exports.exportExcel = async (req, res) => {
    try {
        let { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            dateTo = moment().format("YYYY-MM-DD");
            dateFrom = moment().subtract(30, 'days').format("YYYY-MM-DD");
        }

        const dateQueryCondition = {
            $gte: moment(dateFrom).startOf('day').toDate(),
            $lte: moment(dateTo).endOf('day').toDate()
        };

        const account = await AccountAdmin.countDocuments({ status: "active" });
        const order = await Order.find({ deleted: false, createdAt: dateQueryCondition });
        const totalOrders = order ? order.length : 0;

        const orderPay = await Order.find({
            deleted: false,
            payStatus: "paid",
            createdAt: dateQueryCondition
        });
        const totalPrice = orderPay.reduce((sum, item) => sum + item.priceTotal, 0);

        const bookList = await Book.find({ deleted: false });
        let almostOver = 0, many = 0, soldOut = 0, totalBook = 0;
        for (let item of bookList) {
            if (item.numberBook <= 15 && item.numberBook > 0) almostOver++;
            if (item.numberBook > 15) many++;
            if (item.numberBook == 0) soldOut++;
            totalBook += item.numberBook;
        }

        const dataRevenueByDay = [];
        let start = moment(dateFrom);
        const end = moment(dateTo);
        
        while (start.isSameOrBefore(end, 'day')) {
            const currentDayLabel = start.format("DD/MM");
            const currentDayFull = start.format("YYYY-MM-DD");
            
            let totalDayPrice = 0;
            for (const item of orderPay) {
                const orderDateLabel = moment(item.createdAt).format("DD/MM");
                if (currentDayLabel === orderDateLabel) {
                    totalDayPrice += item.priceTotal;
                }
            }
            
            dataRevenueByDay.push({
                dateDisplay: start.format("DD/MM/YYYY"),
                total: totalDayPrice
            });
            
            start.add(1, 'days'); 
        }

        for (let b of bookList) {
            b.sold = 0;
            b.profit = 0;
            for (let o of orderPay) {
                for (let item of o.cart) {
                    if (item.id_book == b.id) {
                        b.sold += item.quantity;
                        b.profit += (item.priceLast * item.quantity);
                    }
                }
            }
        }
        const topBook = bookList
            .filter(b => b.sold > 0)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        const orderNew = await Order.find({
            deleted: false,
            createdAt: dateQueryCondition
        }).limit(10).sort({ createdAt: "desc" });

        for (let o of orderNew) {
            o.valueMethod = variable.method.find(item => item.value == o.method);
            o.valueStatusPay = variable.payStatus.find(item => item.value == o.payStatus);
            o.nameMethod = o.valueMethod ? o.valueMethod.lable : "";
            o.nameStatusPay = o.valueStatusPay ? o.valueStatusPay.lable : "";
            o.formatTime = moment(o.createdAt).format("HH:mm");
            o.formatDay = moment(o.createdAt).format("DD/MM/YYYY");
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tổng quan báo cáo");

        worksheet.columns = [
            { width: 20 }, 
            { width: 45 }, 
            { width: 45 }, 
            { width: 25 }, 
            { width: 20 }, 
            { width: 20 } 
        ];


        worksheet.mergeCells("A1:F1");
        const titleRow = worksheet.getCell("A1");
        titleRow.value = "BÁO CÁO TỔNG QUAN HỆ THỐNG SÁCH";
        titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
        titleRow.alignment = { vertical: "middle", horizontal: "center" };
        titleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007BFF" } };
        worksheet.getRow(1).height = 40;

    
        worksheet.mergeCells("A2:F2");
        const subTitleRow = worksheet.getCell("A2");
        subTitleRow.value = `Khoảng thời gian báo cáo: từ ngày ${moment(dateFrom).format("DD/MM/YYYY")} đến ngày ${moment(dateTo).format("DD/MM/YYYY")}`;
        subTitleRow.font = { name: "Arial", size: 11, italic: true };
        subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getRow(2).height = 20;

        worksheet.addRow([]); 


        worksheet.addRow(["I. SỐ LIỆU TỔNG HỢP NHANH"]).font = { size: 12, bold: true, color: { argb: "FF28A745" } };
        const rHeaderSummary = worksheet.addRow(["Chỉ số doanh thu", "Giá trị thực tế", "", "Chỉ số kho hàng", "Giá trị tồn kho", ""]);
        rHeaderSummary.font = { bold: true };
        
        worksheet.addRow(["Tổng số đơn hàng", totalOrders, "", "Tổng số lượng sách trong kho", totalBook, ""]);
        worksheet.addRow(["Tổng doanh thu (Đã thanh toán)", totalPrice, "", "Sách sắp hết hàng (<=15)", almostOver, ""]);
        worksheet.addRow(["Tài khoản Admin (Active)", account, "", "Sách đã hết hàng (0)", soldOut, ""]);
        
        worksheet.getCell("B6").numberFormat = "#,##0";
        worksheet.getCell("B7").numberFormat = "#,##0\"đ\"";
        worksheet.getCell("E5").numberFormat = "#,##0";
        worksheet.getCell("E6").numberFormat = "#,##0";
        worksheet.getCell("E7").numberFormat = "#,##0";

        worksheet.addRow([]);


        worksheet.addRow(["II. CHI TIẾT DOANH THU THEO NGÀY"]).font = { size: 12, bold: true, color: { argb: "FF28A745" } };
        const chartHeader = worksheet.addRow(["Ngày", "Doanh thu", "", "", "", ""]);
        chartHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
        chartHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6F42C1" } }; // Màu tím biểu đồ đặc trưng
        chartHeader.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6F42C1" } };

        dataRevenueByDay.forEach(item => {
            const row = worksheet.addRow([item.dateDisplay, item.total, "", "", "", ""]);
            row.getCell(2).numberFormat = "#,##0\"đ\"";
            row.getCell(1).alignment = { horizontal: "center" };
        });

        worksheet.addRow([]); 

        worksheet.addRow(["III. TOP SÁCH BÁN CHẠY NHẤT"]).font = { size: 12, bold: true, color: { argb: "FF28A745" } };
        const topBookHeader = worksheet.addRow(["STT", "Tên sách", "Số lượng đã bán", "Doanh thu mang lại", "", ""]);
        topBookHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
        topBookHeader.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6C757D" } };
        });

        topBook.forEach((item, index) => {
            const row = worksheet.addRow([index + 1, item.name, item.sold, item.profit, "", ""]);
            row.getCell(3).numberFormat = "#,##0";
            row.getCell(4).numberFormat = "#,##0\"đ\"";
        });

        worksheet.addRow([]); // Dòng trống


        worksheet.addRow(["IV. DANH SÁCH ĐƠN HÀNG MỚI"]).font = { size: 12, bold: true, color: { argb: "FF28A745" } };
        const orderHeader = worksheet.addRow(["Mã đơn", "Thông tin khách hàng", "Danh sách sản phẩm", "Thông tin thanh toán", "Trạng thái đơn", "Ngày đặt đơn"]);
        orderHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
        orderHeader.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17A2B8" } };
        });

        orderNew.forEach(item => {
            const customerInfo = `Họ tên: ${item.fullName}\nSĐT: ${item.phone}${item.note ? '\nLời nhắn: ' + item.note : ''}`;
            let cartInfo = item.cart && item.cart.length > 0 ? item.cart.map(it => `- ${it.name} (SL: ${it.quantity} x ${it.priceLast.toLocaleString("vi-VN")}đ)`).join("\n") : "";

            let statusText = "Khởi tạo";
            if (item.status === "package") statusText = "Đóng gói đơn hàng";
            if (item.status === "sent") statusText = "Đã gửi ĐVVC";
            if (item.status === "ship") statusText = "Đang giao hàng";
            if (item.status === "done") statusText = "Đã giao hàng";
            if (item.status === "cancel") statusText = "Hủy đơn";

            const paymentInfo = `Tổng: ${item.priceTotal.toLocaleString("vi-VN")}đ\nPTTT: ${item.nameMethod}\nTTTT: ${item.nameStatusPay}`;
            const orderDateStr = `${item.formatTime} ${item.formatDay}`;

            const row = worksheet.addRow([item.orderCode, customerInfo, cartInfo, paymentInfo, statusText, orderDateStr]);
            row.getCell(2).alignment = { wrapText: true, vertical: "top" };
            row.getCell(3).alignment = { wrapText: true, vertical: "top" };
            row.getCell(4).alignment = { wrapText: true, vertical: "top" };
            row.getCell(5).alignment = { vertical: "top", horizontal: "center" };
            row.getCell(6).alignment = { vertical: "top", horizontal: "center" };
        });

        // BORDER TOÀN FILE
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                row.eachCell(cell => {
                    if (cell.value !== null && cell.value !== "") {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'D3D3D3' } },
                            left: { style: 'thin', color: { argb: 'D3D3D3' } },
                            bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
                            right: { style: 'thin', color: { argb: 'D3D3D3' } }
                        };
                    }
                });
            }
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=BaoCaoTongQuan_${moment().format("DD-MM-YYYY_HHmm")}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Lỗi Xuất Excel Tổng Quan:", error);
        res.status(500).send("Có lỗi xảy ra khi xuất file excel!");
    }
};
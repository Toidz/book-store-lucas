const Category = require("../../models/category.model")
const categoryHelper = require("../../helpers/category.helper")
const Book = require("../../models/book.model") 
const AccountAdmin = require("../../models/account-admin.model")
const moment = require("moment")
const slugify = require("slugify")
const generateHelper = require("../../helpers/generate.helper")
const Event = require("../../models/event.model")
module.exports.list = async (req,res) =>{
    const find = {
        deleted:false
    }
    if(req.query.status){
        find.status = req.query.status
    }
    if(req.query.id){
        find.createdBy = req.query.id
    }
    if(req.query.stock){
        if(req.query.stock==0) find.numberBook = 0
        if(req.query.stock == 15) {
            find.numberBook = { $lte: 15 , $gt:0}; 
        }
    }
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const filterDate = {}
    if(startDate){
        filterDate.$gte = moment(startDate).startOf("date").toDate()
    }
    if(endDate){
        filterDate.$lte = moment(endDate).endOf("date").toDate()
    }
    if(Object.keys(filterDate).length>0){
        find.createdAt = filterDate
    }
    const filterPrice = req.query.price
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
            find.priceBook = priceCurrent
        } 
    }
    const totalFind = {
        deleted:false,
    }
    if(req.query.category){
        const idss = await Category.find({
            parent:""
        })
        const idssArray = []
        idss.forEach(item => {
            idssArray.push(item.id)
        });
        const ids = await Category.find({
            parent: {$in:idssArray} 
        })
        const idsArray = []
        ids.forEach(item => {
            idsArray.push(item.id)
        });

        if(idssArray.includes(req.query.category)){
            const listParent = await Category.find({
                parent: req.query.category
            })
            const listParentArray = []
            listParent.forEach(item => {
                listParentArray.push(item.id)
            });

            const listChild = await Category.find({
                parent: {$in:listParentArray}
            })

            const listChildArray = []
            listChild.forEach(item => {
                listChildArray.push(item.id)
            });
            totalFind.category = {$in:listChildArray}
            find.category = {$in:listChildArray}
        }
        else if(idsArray.includes(req.query.category)){
            const listChild = await Category.find({
                parent: req.query.category
            })

            const listChildArray = []
            listChild.forEach(item => {
                listChildArray.push(item.id)
            });
            totalFind.category = {$in:listChildArray}
            find.category = {$in:listChildArray}
        }
        else find.category= req.query.category
    }

    const keyword = req.query.keyword
    if(keyword){
        const slug = slugify(keyword,{
            lower:true,
            locale: 'vi'
        })
        const regex = new RegExp(slug,"i")
        find.slug= regex
    }
    const limit =6
    const totalBook = await Book.countDocuments(find)
    const totalPage = Math.ceil(totalBook/limit)
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }  
    if(req.query.page>totalPage && totalPage >0 ){
        page = totalPage
    }
    const skip = limit*(page-1)

    const bookList = await Book.find(find
    ).sort({
        position:"desc"
    })
    .limit(limit)
    .skip(skip)
    
    const accountList = await AccountAdmin.find({
        status:"active"
    })
    const categoryList = await Category.find({
        deleted:false
    })
    const categoryTree = categoryHelper.categoryTree(categoryList)
    for (const item of bookList) {
        if(item.createdBy){
            const createdByName = await AccountAdmin.findOne({
                _id: item.createdBy
            })
            item.createdBy = createdByName.fullName
        }
        if(item.updatedBy){
            const updatedByName = await AccountAdmin.findOne({
                _id: item.updatedBy
            })
            item.updatedBy = updatedByName.fullName
        }
        item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY")
        item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY")
        if(item.idEvent){
            const eventName = await Event.findOne({
                _id:item.idEvent
            })
            item.eventName = eventName.name
            item.discount= eventName.discount
        }
    };
    const eventList = await Event.find({
        deleted:false,
        status:"active"
    })
    res.render("admin/pages/book-list",{
        pageTitle:"Quản lý sách",
        bookList:bookList,
        accountList:accountList,
        categoryList:categoryTree,
        totalBook:totalBook,
        totalPage:totalPage,
        skip:skip,
        eventList:eventList
    })
}

module.exports.create = async (req,res) =>{
    const categoryList = await Category.find({
        deleted:false
    })
    const categoryTree = categoryHelper.categoryTree(categoryList)
    res.render("admin/pages/book-create",{
        pageTitle:"Tạo book",
        categoryList: categoryTree,
    })
}

module.exports.createPost = async (req,res) =>{
    const bookCode = "BO" + generateHelper.generateRandomNumber(6)
    req.body.bookCode = bookCode
    if(req.body.position){
        req.body.position = parseInt(req.body.position)
    }
    else{
        const position = await Book.countDocuments({})
        req.body.position = position +1
    }
    if(req.files&&req.files.avatar1){
        req.body.avatar1 =  req.files.avatar1[0].path
    }
    else{
        delete req.body.avatar1
    }
    if(req.files&&req.files.avatar2){
        req.body.avatar2 =  req.files.avatar2[0].path
    }
    else{
        delete req.body.avatar2
    }
    if(req.files&&req.files.avatar3){
        req.body.avatar3 =  req.files.avatar3[0].path
    }
    else{
        delete req.body.avatar3
    }
    req.body.priceBook = req.body.priceBook? parseInt(req.body.priceBook): 0
    req.body.priceSale = req.body.priceBook? parseInt(req.body.priceBook): 0
    req.body.numberBook = req.body.numberBook? parseInt(req.body.numberBook): 0
    req.body.createdBy = req.account.id
    req.body.updatedBy = req.account.id
    const exitsBook = await Book.findOne({
        name: req.body.name
    })
    if(exitsBook){
        res.json({
            code:"error",
            message:"Sách này đã có trong hệ thống!"
        })
        return
    }
    const dataFinal = new Book(req.body)
    await dataFinal.save()
    req.flash("success", "Tạo sách thành công!");
    res.json({
        code:"success",
        message:"Tạo sách thành công!"
    })
}

module.exports.changePatch = async (req,res) =>{
    try {
        const { ids, id_event } = req.body
        if(id_event){
            const eventCurrent = await Event.findOne({
                deleted:false,
                _id:id_event
            })
            const bookList = await Book.find({
                _id:{$in:ids},
                deleted:false
            })
            for(const item of bookList){
                const priceSale = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(eventCurrent.discount)/100
                await Book.updateOne({
                    _id:item.id
                },{
                    idEvent:id_event,
                    priceSale:priceSale
                })
            }
        }
        else{
            const bookList = await Book.find({
                _id:{$in:ids},
                deleted:false
            })
            for(const item of bookList){
                await Book.updateOne({
                    _id:item.id
                },{
                    idEvent:id_event,
                    priceSale:parseInt(item.priceBook)
                })
            }
        }
        req.flash("success", "Gán sự kiện thành công!");
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

module.exports.edit = async (req,res) =>{
    try {
        const categoryList = await Category.find({
            deleted:false
        })
        const id= req.params.id
        const currentBook = await Book.findOne({
            _id:id,
            deleted:false
        })

        const categoryTree = categoryHelper.categoryTree(categoryList)
        res.render("admin/pages/book-edit",{
            pageTitle:"Chỉnh sửa sách",
            categoryList:categoryTree,
            currentBook:currentBook
        })
    } catch (error) {
        res.redirect(`/${pathAdmin}/book/list`)     
    }
}

module.exports.editPatch = async (req,res) =>{
    try {
        const id = req.params.id
        if(req.body.position){
            req.body.position= parseInt(req.body.position)
        }
        else{
            const totalCount= await Book.countDocuments({})
            req.body.position = totalCount +1
        }

        if(req.files&&req.files.avatar1){
            req.body.avatar1 =  req.files.avatar1[0].path
        }
        else{
            delete req.body.avatar1
        }
        if(req.files&&req.files.avatar2){
            req.body.avatar2 =  req.files.avatar2[0].path
        }
        else{
            delete req.body.avatar2
        }
        if(req.files&&req.files.avatar3){
            req.body.avatar3 =  req.files.avatar3[0].path
        }
        else{
            delete req.body.avatar3
        }
     
        req.body.priceBook = req.body.priceBook? parseInt(req.body.priceBook): 0
        req.body.numberBook = req.body.numberBook? parseInt(req.body.numberBook): 0
        req.body.updatedBy = req.account.id
        await Book.updateOne({
            _id:id,
            deleted:false
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

module.exports.deletePatch= async(req,res)=>{
    try {
        const id=req.params.id
        await Book.updateOne({
            _id:id
        },{
            deleted:true,
            deletedAt:Date.now(),
            deletedBy:req.account.id
        })
        req.flash("success","Xóa sách thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa sách thất bại!"
        })
    }
    
}

module.exports.trash = async (req,res) =>{
    const keyword = req.query.keyword
    const find = {
        deleted:true
    }
    if(keyword){
        const slug = slugify(keyword)
        const regex = new RegExp(slug,"i")
        find.slug= regex
    }
    const limit=3
    let page =1
    const totalbook = await Book.countDocuments({
        deleted:true
    })
    const totalPage = Math.ceil(totalbook/limit)
    if(req.query.page){
        page = req.query.page
    }
    const skip =limit*(page-1)
    const bookList = await Book.find(find
    ).sort({
        position: "desc"  
    }).limit(
        limit
    ).skip(
        skip
    )
    if(bookList.length>0){
        for(const item of bookList){
            if(item.createdBy){
                const creater = await AccountAdmin.findOne({
                _id:item.createdBy
                })
                item.createrName = creater.fullName
            }
            if(item.updatedBy){
                const updater = await AccountAdmin.findOne({
                    _id:item.updatedBy
                })
                item.updaterName = updater.fullName
            }
            item.formatCreated = moment(item.createdAt).format("HH:MM - DD/MM/YYYY")
            item.formatUpdated = moment(item.updatedAt).format("HH:MM - DD/MM/YYYY")
        };
       
    }
    res.render("admin/pages/book-trash",{
        pageTitle:"Thùng rác book",
        bookList:bookList,
        totalPage:totalPage,
        totalbook:totalbook,
        skip:skip
    })
}

module.exports.trashMulti = async (req,res) =>{
    try {
        switch(req.body.status){
            case "restore":
                await Book.updateMany({
                    _id:{$in:req.body.ids}
                    },{
                    deleted:false
                    })
                req.flash("success","Khôi phục thành công!")
                break
            case "delete":
                await Book.deleteMany({
                    _id:{$in:req.body.ids}
                    })
                req.flash("success","Xóa vĩnh viễn thành công!")
                break
        }
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

module.exports.restore = async(req,res)=>{
   try {
    const id = req.params.id
    await Book.updateOne({
        _id:id
    },{
        deleted:false
    })
    req.flash("success","Khôi phục thành công!")
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

module.exports.destroy = async(req,res)=>{
   try {
    const id = req.params.id
    await Book.deleteOne({
        _id:id
    })
    req.flash("success","Xóa vĩnh viễn thành công!")
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
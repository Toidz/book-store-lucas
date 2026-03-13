const Category = require("../../models/category.model")
const AccountAdmin = require("../../models/account-admin.model")
const categoryHelper = require("../../helpers/category.helper")
const moment = require("moment");
const slugify = require("slugify")
module.exports.create = async (req,res) =>{
    const categoryList = await Category.find({
        deleted:false
    })
    const categoryTree = categoryHelper.categoryTree(categoryList)
    res.render("admin/pages/category-create",{
        pageTitle:"Tạo danh mục",
        categoryList: categoryTree
    })
}
module.exports.createPost = async (req,res) =>{

    if(req.body.position){
        req.body.position = parseInt(req.body.position)
    }
    else{
        const totalPosition = await Category.countDocuments({})
        req.body.position = totalPosition + 1
    }

    req.body.createdBy = req.account.id
    req.body.updatedBy = req.account.id
    req.body.avatar = req.file? req.file.path : " "
    const exitsCategory = await Category.findOne({
        name: req.body.name
    })

    if(exitsCategory){
        res.json({
            code:"error",
            message:"Danh mục này đã có trong hệ thống!"
        })
        return
    }
    const dataFinal = new Category(req.body)
    await dataFinal.save()

    req.flash("success", "Tạo danh mục thành công!");
    res.json({
        code:"success",
    })
}

module.exports.list = async (req,res) =>{
    const id = req.query.id
    const startDate = req.query.startdate
    const endDate = req.query.enddate
    const dateFilter = {}
    const keyword = req.query.keyword
    const find = {
        deleted:false,
    }
    if(id){
        find.createdBy = id
    }
    if(startDate){
        dateFilter.$gte = moment(startDate).startOf("date").toDate()
    }
    if(endDate){
        dateFilter.$lte = moment(endDate).endOf("date").toDate()
    }
    if(Object.keys(dateFilter).length>0){
        find.createdAt = dateFilter
    }
    if(keyword){
        const slug= slugify(keyword, {
            lower:true
        })
        const keywordRegex =  new RegExp(slug,"i")
        find.slug = keywordRegex 
    }
    const limnit = 4
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }
    const skip = (page -1)*limnit
    const totalCategory = await Category.countDocuments(find)
    const pagination ={
        totalPage:Math.ceil(totalCategory/limnit),
        totalCategory:totalCategory,
        skip:skip
    }
    const categoryList = await Category
    .find(find).
    sort({
        position:"desc"
    }).
    limit(limnit).
    skip(skip)


    for (const item of categoryList) {
        if(item.createdBy){
            const createdByName = await AccountAdmin.findOne({
                _id: item.createdBy
            })
            item.createdByName = createdByName.fullName
        }
        if(item.updatedBy){
            const updatedByName = await AccountAdmin.findOne({
                _id: item.updatedBy
            })
            item.updatedByName = updatedByName.fullName
        }
        item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY")
        item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY")
    };

    const accountList = await AccountAdmin.find({
    }).select("id fullName")
    
    res.render("admin/pages/category-list",{
        pageTitle:"Quản lý danh mục",
        categoryList: categoryList,
        accountList: accountList,
        pagination:pagination
    })
}
module.exports.listPatch = async (req,res) =>{
    try {
        const ids = req.body.ids
        await Category.updateMany({
            _id :{$in:ids}
        },{
            deleted:true,
            deletedAt:Date.now(),
            deletedBy:req.account.id
        })
        req.flash("success","Xóa danh mục thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa danh mục thất bại!"
        })
    }
}


module.exports.edit = async (req,res) =>{
    try{
    const categoryList = await Category.find({
        deleted:false
    })
    const categoryTree = categoryHelper.categoryTree(categoryList)
    const categoryCurrent = await Category.findOne({
        _id:req.params.id,
        deleted:false
    })
    res.render("admin/pages/category-edit",{
        pageTitle:"Tạo danh mục",
        categoryList: categoryTree,
        categoryCurrent:categoryCurrent
    })
    } catch (error) {
        res.redirect(`/${pathAdmin}/category/list`)
    }
}

module.exports.editPatch = async (req,res) =>{
   try{
    const id = req.params.id
    if(req.body.position){
        req.body.position = parseInt(req.body.position)
    }
    else{
        const totalPosition = await Category.countDocuments({})
        req.body.position = totalPosition + 1
    }
    req.body.updatedBy = req.account.id
    if(req.file){
        req.body.avatar = req.file.path
    } else{
        delete req.body.avatar
    }
    await Category.updateOne({
        _id:id,
        deleted:false
    }, req.body)
    req.flash("success", "Chỉnh sửa danh mục thành công!");
    res.json({
        code:"success",
    })
   }catch(error){
    res.json({
        code:"error",
        message:"Id không hợp lệ"
    })
   }
}

module.exports.deletePatch = async (req,res) =>{
    try{
        const id = req.params.id
        await Category.updateOne({
            _id:id
        },{
            deleted:true,
            deletedBy: req.account.id,
            deletedAt: Date.now()
        })
        req.flash("success","Xóa danh mục thành công!")
        res.json({
            code:"success"
        })
    }catch(error){
        res.json({
            code:"error",
            message:"Xóa danh mục thất bại!"
        })
    }
}

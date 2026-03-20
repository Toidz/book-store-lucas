const New = require("../../models/new.model") 
const AccountAdmin = require("../../models/account-admin.model")
const moment = require("moment")
const slugify = require("slugify")

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

    const keyword = req.query.keyword
    if(keyword){
        const slug = slugify(keyword,{
            lower:true,
            locale: 'vi'
        })
        const regex = new RegExp(slug,"i")
        find.slug= regex
    }
    const limit =3
    const totalNew = await New.countDocuments(find)
    const totalPage = Math.ceil(totalNew/limit)
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }  
    if(req.query.page>totalPage && totalPage >0 ){
        page = totalPage
    }

    const skip = limit*(page-1)

    const newList = await New.find(find
    ).sort({
        position:"desc"
    })
    .limit(limit)
    .skip(skip)


    const accountList = await AccountAdmin.find({
        status:"active"
    })
    for (const item of newList) {
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
    };
    res.render("admin/pages/new-list",{
        pageTitle:"Quản lý bài viết",
        newList:newList,
        totalNew:totalNew,
        accountList:accountList,
        totalPage:totalPage,
        skip:skip
    })
}

module.exports.create = async (req,res) =>{

    res.render("admin/pages/new-create",{
        pageTitle:"Tạo bài viết",
    })
}

module.exports.createPost = async (req,res) =>{
    if(req.body.position){
        req.body.position = parseInt(req.body.position)
    }
    else{
        const position = await New.countDocuments({})
        req.body.position = position +1
    }
    if(req.file){
        req.body.avatar =  req.file.path
    }
    else{
        delete req.body.avatar
    }
    req.body.createdBy = req.account.id
    req.body.updatedBy = req.account.id
    const dataFinal = new New(req.body)
    await dataFinal.save()
    req.flash("success", "Tạo bài viết thành công!");
    res.json({
        code:"success",
        message:"Tạo bài viết thành công!"
    })
}

module.exports.changePatch = async (req,res) =>{
    try {
        const {ids} = req.body
        await New.updateMany({
            _id:{$in:ids}
        },{
            deleted:true,
            deletedBy:req.account.id,
            deletedAt:Date.now()
        })
        req.flash("success", "Xóa bài viết thành công!");
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật bài viết thất bại!"
        })
    }
}

module.exports.edit = async (req,res) =>{
    try {
        const id= req.params.id
        const currentNew = await New.findOne({
            _id:id,
            deleted:false
        })

    
        res.render("admin/pages/new-edit",{
            pageTitle:"Chỉnh sửa bài viết",
            currentNew:currentNew
        })
    } catch (error) {
        res.redirect(`/${pathAdmin}/new/list`)     
    }
}

module.exports.editPatch = async (req,res) =>{
    try {
        const id = req.params.id
        if(req.body.position){
            req.body.position= parseInt(req.body.position)
        }
        else{
            const totalCount= await New.countDocuments({})
            req.body.position = totalCount +1
        }

        if(req.file){
            req.body.avatar =  req.file.path
        }
        else{
            delete req.body.avatar
        }
      
        req.body.updatedBy = req.account.id
        await New.updateOne({
            _id:id,
            deleted:false
        },req.body)
        req.flash("success","Cập nhật bài viết thành công!")
        res.json({
            code:"success"
        })
       
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật bài viết thất bại!"
        })
    }
}

module.exports.deletePatch= async(req,res)=>{
    try {
        const id=req.params.id
        await New.updateOne({
            _id:id
        },{
            deleted:true,
            deletedAt:Date.now(),
            deletedBy:req.account.id
        })
        req.flash("success","Xóa bài viết thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa bài viết thất bại!"
        })
    }
    
}


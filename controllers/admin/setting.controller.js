const SettingWebsiteInfo = require("../../models/setting-website-info.model")
const permissionList = require("../../config/permission")
const Role = require("../../models/roles.model")
const AccountAdmin = require("../../models/account-admin.model")
const AccountClient = require("../../models/account-client.model")
const slugify = require("slugify")
const bcrypt = require("bcryptjs")
const moment = require("moment")

module.exports.accountAdminCreate = async (req,res) =>{
    const roleList = await Role.find({
        deleted:false
    })
    res.render("admin/pages/setting-account-admin-create",{
        pageTitle:"Tạo tài khoản nội bộ",
        roleList:roleList
    })
}
module.exports.accountAdminCreatePost =async (req,res) =>{ 
    console.log(req.body)
    const existAccount = await AccountAdmin.findOne({
        email:req.body.email
    })
    if(req.file){
        req.body.avatar = req.file.path
    }
    else{
        delete req.body.avater
    }
    if(existAccount){
        res.json({
            code:"error",
            message:"Email đã tồn tại trong hệ thống!"
        })
        return
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash

    const dataFinal = new AccountAdmin(req.body)
    await dataFinal.save()
    req.flash("success","Tạo tài khoản thành công!")
    res.json({
        code:"success",
    })

}

module.exports.accountAdminEdit = async (req,res) =>{
    try {
        const id = req.params.id
        if (!id || id === "null") {
            return res.status(400).send("ID không hợp lệ");
        }
        const roleList = await Role.find({
            deleted:false
        })
        const accountCurrent = await AccountAdmin.findOne({
            _id:id
        })
        res.render("admin/pages/setting-account-admin-edit",{
            pageTitle:"Sửa tài khoản nội bộ",
            roleList:roleList,
            accountCurrent:accountCurrent
        })
    } catch (error) {
        res.redirect(`/${pathAdmin}/error-404`);
    }
}

module.exports.accountAdminEditPatch = async (req,res) =>{
    try {
        const id = req.params.id
        if(req.file){
            req.body.avatar = req.file.path
        }
        else{
            delete req.body.avatar
        }

        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = hash
        }
        await AccountAdmin.updateOne({
            _id:id
        },req.body)
        req.flash("success","Cập nhật tài khoản thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật tài khoản thất bại!"
        })
    }
}

module.exports.accountAdminDeletePatch = async (req,res) =>{
    try {
        const id = req.params.id
        await AccountAdmin.deleteOne({
            _id:id
        })
        req.flash("success","Xóa tài khoản thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa tài khoản thất bại!"
        })
    }
}
module.exports.accountAdminChangePatch = async (req,res) =>{
    try {
        const {status,ids} = req.body
        switch(status){
            case "active": case "initial":
                await AccountAdmin.updateMany({
                    _id:{$in:ids}
                },{
                    status:status
                })
                req.flash("success", "Cập nhật tài khoản thành công!");
                break
            case "delete":
                await AccountAdmin.deleteMany({
                    _id:{$in:ids}
                })
                req.flash("success", "Xóa tài khoản thành công!");
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
module.exports.accountAdminList = async (req,res) =>{
    const find ={}
    if(req.query.status){
        find.status = req.query.status
    }
    const time ={}
    if(req.query.startdate){
        time.$gte = moment(req.query.startdate).startOf("date").toDate()
    }
    if(req.query.enddate){
        time.$lte = moment(req.query.enddate).endOf("date").toDate()
    }
    if(Object.keys(time).length>0){
        find.createdAt = time
    }
    if(req.query.role){
        find.role = req.query.role
    }
    if(req.query.keyword){
        const slug = slugify(req.query.keyword,{
            lower:true,
            locale: 'vi'
        })
        const regex = new RegExp(slug,"i")
        find.slug = regex
    }
    const totalAccount = await AccountAdmin.countDocuments({})
    const limit =3
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }
    const skip = (page-1)*limit
    const totalPage = Math.ceil(totalAccount/limit)

    const accountList = await AccountAdmin
    .find(find)
    .limit(limit)
    .skip(skip)
    const roleList = await Role.find({
        deleted:false
    })
    for (const item of accountList) {
        const roleName = await Role.findOne({
            _id:item.role
        })
        if(roleName) item.roleName = roleName.name
    }

    res.render("admin/pages/setting-account-admin-list",{
        pageTitle:"Tài khoản nội bộ",
        accountList:accountList,
        roleList:roleList,        
        totalPage:totalPage,
        skip:skip,
        totalAccount:totalAccount
    })
}

module.exports.accountClientList = async (req,res) =>{
    const find ={
        deleted:false
    }
    if(req.query.keyword){
        const slug = slugify(req.query.keyword,{
            lower:true,
            locale: 'vi'
        })
        const regex = new RegExp(slug,"i")
        find.slug = regex
    }
    const totalAccountClient = await AccountClient.countDocuments(find)
    const limit = 5
    let page = 1
    if(req.query.page>0){
        page = req.query.page
    }
    const skip = (page-1)*limit
    const totalPage = Math.ceil(totalAccountClient/limit)

    const accountClientList = await AccountClient
    .find(find)
    .limit(limit)
    .skip(skip)
    .sort({
        createdAt:"desc"
    })
    for(const item of accountClientList){
        item.formatCreatedAt = moment(item.createdAt).format("DD/MM/YYYY")
    }
    res.render("admin/pages/setting-account-client-list",{
        pageTitle:"Tài khoản khách hàng",
        accountClientList:accountClientList,
        totalPage:totalPage,
        skip:skip,
        totalAccountClient:totalAccountClient
    })
}

module.exports.accountClientEdit = async (req,res) =>{
    try {
        const id = req.params.id
        if (!id || id === "null") {
            return res.status(400).send("ID không hợp lệ");
        }
        const accountCurrent = await AccountClient.findOne({
            _id:id,
            deleted:false
        })
        res.render("admin/pages/setting-account-client-edit",{
            pageTitle:"Sửa tài khoản khách hàng",
            accountCurrent:accountCurrent
        })
    } catch (error) {
        res.redirect(`/${pathAdmin}/error-404`);
    }
}

module.exports.accountClientEditPatch = async (req,res) =>{
    try {
        const id = req.params.id
        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = hash
        }
        else{
            delete req.body.password
        }
        await AccountClient.updateOne({
            _id:id,
            deleted:false
        },req.body)
        req.flash("success","Cập nhật tài khoản khách hàng thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật tài khoản khách hàng thất bại!"
        })
    }
}

module.exports.accountClientDeletePatch = async (req,res) =>{
    try {
        const id = req.params.id
        await AccountClient.updateOne({
            _id:id,
            deleted:false
        },{
            deleted:true,
            deletedAt:Date.now(),
            deletedBy:req.account.id
        })
        req.flash("success","Xóa tài khoản khách hàng thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa tài khoản khách hàng thất bại!"
        })
    }
}


module.exports.list = async (req,res) =>{
    res.render("admin/pages/setting-list",{
        pageTitle:"Cài đặt chung"
    })
}

module.exports.roleCreate = (req,res) =>{
    res.render("admin/pages/setting-role-create",{
        pageTitle:"Tạo nhóm quyền",
        permissionList: permissionList.permission
    })
}

module.exports.roleEdit = async (req,res)=>{
    const id = req.params.id
    const currentRole = await Role.findOne({
        _id:id,
        deleted:false
    })
    res.render("admin/pages/setting-role-edit",{
        pageTitle:"Sửa nhóm quyền",
        permissionList: permissionList.permission,
        role:currentRole
    })
}

module.exports.roleEditPatch = async (req,res)=>{
    try {
        const id = req.params.id
        req.body.updatedBy = req.account.id
        await Role.updateOne({
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

module.exports.roleDeletePatch = async (req,res)=>{
    try {
        const id = req.params.id
        req.body.updatedBy = req.account.id
        await Role.updateOne({
            _id:id,
        },{
            deleted:true, 
            deletedAt:Date.now(),
            deletedBy:req.account.id
        })
        req.flash("success","Xóa thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa thất bại!"
        })
    }
}

module.exports.roleCreatePost = async (req,res) =>{
    req.body.createdBy = req.account.id
    req.body.updatedBy = req.account.id
    const dataFinal = new Role(req.body)
    await dataFinal.save()
    req.flash("success","Tạo mới nhóm quyền thành công!")
    res.json({
        code:"success"
    })
}

module.exports.roleList = async (req,res) =>{
    const keyword = req.query.keyword
    const find ={
        deleted:false
    }
    if(keyword){
        const slug= slugify(keyword.trim())
        const regex = new RegExp(slug,"i")
        find.slug=regex
    }
    const roleList = await Role.find(find)
    res.render("admin/pages/setting-role-list",{
        pageTitle:"Nhóm quyền",
        roleList:roleList
    })
}

module.exports.roleListPatch = async (req,res) =>{
    try {
        const {status,ids} = req.body;
        if(status=="delete"){
            await Role.updateMany({
                _id:{$in:ids},
                deleted:false
            },{
                deleted:true,
                deletedBy:req.account.id,
                deletedAt:Date.now()
            })
        }
        req.flash("success","Xóa nhóm quyền thành công!")
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

module.exports.websiteInfo = async (req,res) =>{
     const websiteInfo = await SettingWebsiteInfo.findOne({})
    res.render("admin/pages/setting-website-info",{
        pageTitle:"Thông tin website",
        websiteInfo:websiteInfo
    })
}
module.exports.websiteInfoPatch = async (req,res) =>{
    if(req.files&&req.files.logo){
        req.body.logo = req.files.logo[0].path
    }
    else{
        delete req.body.logo
    }

    if(req.files&&req.files.favicon){
        req.body.favicon = req.files.favicon[0].path
    }
    else{
        delete req.body.favicon
    }
    const websiteInfo = await SettingWebsiteInfo.findOne({})
    if(websiteInfo){
        await SettingWebsiteInfo.updateOne({
            _id:websiteInfo.id
        },
            req.body
        )
    }
    else{
        const dataFinal = new SettingWebsiteInfo(req.body)
        await dataFinal.save()
    }
    req.flash("success","Cập nhật thành công!")
    res.json({
        code:"success"
    })
}
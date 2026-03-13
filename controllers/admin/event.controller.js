const Event = require("../../models/event.model")
const moment = require("moment")
const slugify = require("slugify")
const Book = require("../../models/book.model")
module.exports.list= async (req,res)=>{
    let find ={
        deleted:false
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
    const totalevent = await Event.countDocuments(find)
    const totalPage = Math.ceil(totalevent/limit)
    let page =1
    if(req.query.page>0){
        page = req.query.page
    }  
    if(req.query.page>totalPage && totalPage >0 ){
        page = totalPage
    }
    const skip = limit*(page-1)
    const eventList = await Event.find(find)
    .limit(limit)
    .skip(skip)
    for (const item of eventList) {
        item.startFormat = moment(item.startDate).format("DD/MM/YYYY")
        item.endFormat = moment(item.endDate).format("DD/MM/YYYY")
    };
    res.render("admin/pages/event-list",{
        pageTitle:"Quản lý sự kiện",
        eventList:eventList,
        totalevent:totalevent,
        totalPage:totalPage,
        skip:skip
    })
}
module.exports.create = async (req,res) =>{

    res.render("admin/pages/event-create",{
        pageTitle:"Tạo sự kiện",
    })
}
module.exports.createPost = async (req,res) =>{
    try {
        console.log(req.body)
        if(req.file){
            req.body.avatar =  req.file.path
        }
        else{
            delete req.body.avatar
        }
        console.log(req.body.avatar)
        const dataFinal = new Event(req.body)
        await dataFinal.save()
        req.flash("success", "Tạo sự kiện thành công!");
        res.json({
            code:"success",
            message:"Tạo sự kiện thành công!"
        })
    } catch (error) {
        res.json({
            code:"success",
            message:"Tạo sự kiện thất bại!"
        })
    }
}

module.exports.edit = async (req,res) =>{
    try {
        const id= req.params.id
        const currentEvent = await Event.findOne({
            _id:id,
            deleted:false
        })
        res.render("admin/pages/event-edit",{
            pageTitle:"Chỉnh sửa sự kiện",
            currentEvent:currentEvent
        })
    } catch (error) {
        res.redirect(`/${pathAdmin}/event/list`)     
    }
}

module.exports.editPatch = async (req,res) =>{
    try {
        const id = req.params.id
        if(req.file){
            req.body.avatar =  req.file.path
        }
        else{
            delete req.body.avatar
        }
        
        await Event.updateOne({
            _id:id,
            deleted:false
        },req.body)
        
        if(req.body.status=="stop"){
            const bookFind = await Book.find({
                deleted:false,
            })
            for(let item of bookFind){
                if(item.idEvent == id){
                    await Book.updateOne({
                        deleted:false,
                        idEvent:id
                    },{
                        idEvent:"",
                        priceSale:parseInt(item.priceBook)
                    })
                }        
            }
        }
        req.flash("success","Cập nhật sự kiện thành công!")
        res.json({
            code:"success"
        })
       
    } catch (error) {
        res.json({
            code:"error",
            message:"Cập nhật sự kiện thất bại!"
        })
    }
}
module.exports.deletePatch= async(req,res)=>{
    try {
        const id=req.params.id
        await Event.updateOne({
            _id:id
        },{
            deleted:true,
        })
        req.flash("success","Xóa sự kiện thành công!")
        res.json({
            code:"success"
        })
    } catch (error) {
        res.json({
            code:"error",
            message:"Xóa sự kiện thất bại!"
        })
    }
    
}
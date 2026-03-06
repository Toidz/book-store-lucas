const Book = require("../../models/book.model")
const AddressClient = require("../../models/address.model")
const addressConfig = require("../../config/address")
const AccountClient = require("../../models/account-client.model")
const Cart = require("../../models/cart.model")
const Event = require("../../models/event.model")
module.exports.pay = async (req,res)=>{
  const city=[]
  const addressList = addressConfig.address;
  addressList.forEach(item => {
    city.push(item.name)
  });
  const fullName = await AccountClient.findOne({
    _id:req.account.id
  })
  const addressDefault = await AddressClient.findOne({
    user_id:req.account.id
  })
  const address =
  (addressDefault?.ward? addressDefault.ward : "") +
  (addressDefault?.district? ", " + addressDefault.district : "") +
  (addressDefault?.city? ", " + addressDefault.city : "");
  const listAddress = await AddressClient.find({
    user_id:req.account.id
  })
  listAddress.forEach(item => {
    item.address = (item.ward ? item.ward : "") +
    (item.district ? ", " + item.district : "") +
    (item.city ? ", " + item.city : "");
  });

  const listItem = await Cart.find({
    id_user:req.account.id,
    deleted:false,
    checkItem:true
  })
  
  if(!listItem.length>0){
    return res.redirect("/cart"); 
  }
  let totalMoney = 0
  for (const item of listItem) {
    const book = await Book.findOne({
      _id:item.id_book
    })
    item.name = book.name;
    item.bookCode = book.bookCode;
    item.author = book.author;
    item.produce = book.produce;
    item.priceBook = book.priceBook;
    item.slug = book.slug;
    item.avatar = book.avatar1;
    item.stock = book.numberBook;
   
    if(book.idEvent){
      const event = await Event.findOne({
        _id:book.idEvent,
        deleted:false,
        status:"active"
      })
      let priceLast = parseInt(item.priceBook)-parseInt(item.priceBook)*parseInt(event.discount)/100 
      item.priceLast = priceLast
      totalMoney+=parseInt(item.quantity)*parseInt(item.priceLast)
    }
    else {
      totalMoney+=parseInt(item.quantity)*parseInt(book.priceBook)
      item.priceLast =  item.priceBook
    }
  }
  if (!addressDefault) {
    return res.redirect("/info-user"); 
  }
  res.render("client/pages/pay",{
    pageTitle:"Trang thanh toán",
    listItem:listItem,
    city:city,
    listAddress:listAddress,
    addressDefault:addressDefault,
    address:address,
    fullName:fullName,
    totalMoney:totalMoney
  });
}
module.exports.payPost = async (req,res)=>{
  for (const item of req.body) {
      const book = await Book.findOne({
          _id:item.id,
          deleted:false,
      })
      if(book){
          item.bookCode = book.bookCode
          item.avatar = book.avatar1
          item.slug = book.slug
          item.name=book.name
          item.produce = book.produce
          item.author = book.author
          item.priceBook = book.priceBook
      }
      else{
          const indexItem = req.body.findIndex(book => book.id == item.id)
          req.body.splice(indexItem,1)
      }
  }
  res.json({
      code:"success",
      pay:req.body
  })
}
module.exports.getDistricts = (req, res) => {
  const { cityName } = req.query;
  const city = addressConfig.address.find(item => item.name === cityName);

  if (!city) {
    return res.json({ districts: [] });
  }

  const districts = city.level2s.map(d => d.name);
  res.json({ districts });
};
module.exports.getWards = (req, res) => {
  const { districtName } = req.query;

  let foundDistrict = null;
  for (const city of addressConfig.address) {
    foundDistrict = city.level2s.find(d => d.name === districtName);
    if (foundDistrict) break;
  }

  if (!foundDistrict) {
    return res.json({ wards: [] });
  }

  const wards = foundDistrict.level3s.map(w => w.name);
  res.json({ wards });
};
module.exports.postAddressCreate = async (req,res)=>{
    const {fullName,phone,city,district,ward,street} = req.body;
    const id= req.account.id;
    const existAccount = await AccountClient.findOne({
        _id:id
    })
    if(!existAccount){
        res.json({
            code:"error",
            message:"Tài khoản không tồn tại trong hệ thống!"
        })
        return;
    }
    
    const address = new AddressClient({
        user_id:id,
        name:fullName,
        phone:phone,
        city:city,
        district:district,
        ward:ward,
        street:street
    })
    await address.save()
    
    
    req.flash("success","Tạo địa chỉ mới thành công!")
    res.json({
        code:"success"
    })
}
module.exports.getCurrentAddress = async (req, res) => {
  const {idCurrent} = req.query
  const addressCurrent = await AddressClient.findOne({
    _id:idCurrent,
    deleted:false
  })
  if(addressCurrent){
    res.json({
      code:"success",
      addressCurrent:addressCurrent
    })
  }
  else {
    res.json({
      code:"error"
    })
  }
}
module.exports.editCurrentAddress = async (req, res) => {
  const {id_current,fullName,phone,city,district,ward,street} = req.body;
  await AddressClient.updateOne({
    _id:id_current,
    deleted:false
  },
    {
      name:fullName,
      phone,
      city,
      district,
      ward,
      street
    })
  req.flash("success","Cập nhật địa chỉ thành công!")
  res.json({
    code:"success"
  })
}
module.exports.deleteCurrentAddress = async (req, res) => {
  const {id_current} = req.body;
   const list = await AddressClient.find({
    deleted:false,
    user_id:req.account.id
  })
  if(list.length>1)
  {
    await AddressClient.deleteOne({
      _id:id_current})
    req.flash("success","Xóa địa chỉ thành công!")
    res.json({
      code:"success"
    })
  }
  else{
    res.json({
      code:"error",
      message:"Phải tồn tại ít nhất một địa chỉ!"
    })
  }
}
module.exports.changeAddress = async(req,res)=>{
  const {id_address} = req.query
  const dataFind = await AddressClient.findOne({
    _id:id_address
  })
  res.json({
    dataFind:dataFind
  })
}
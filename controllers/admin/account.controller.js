const AccountAdmin = require("../../models/account-admin.model")
const ForgotPassword = require("../../models/forgotPassword.model")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateHelper = require("../../helpers/generate.helper");
const mailerHelper = require("../../helpers/mailer.helper")
module.exports.login = (req,res)=>{
    res.render("admin/pages/login",{
        pageTitle:"Đăng nhập"
    })
}
module.exports.loginPost = async (req,res)=>{
    const {email,password} = req.body;
    const existAccount = await AccountAdmin.findOne({
        email:email,
    })
    if(!existAccount){
        res.json({
            code:"error",
            message:"Email không tồn tại trong hệ thống!"
        });
        return;
    }
    const isPassword = await bcrypt.compare(password,existAccount.password);
    if(!isPassword){
        res.json({
            code:"error",
            message:"Mật khẩu không đúng!"
        });
        return;
    }
    if(existAccount.status!="active"){
        res.json({
            code:"error",
            message:"Tài khoản chưa được kích hoạt!"
        });
        return;
    }

    const token = jwt.sign(
        {
            id:existAccount.id,
            email:existAccount.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1d"
        }
    )
    res.cookie("token",token,{
        maxAge:24*60*60*1000,
        httpOnly:true,
        sameSite:"strict"
    })

    res.json({
        code:"success",
        message:"Đăng nhập thành công!"
    })
}
// module.exports.register = (req,res)=>{
//     res.render("admin/pages/register",{
//         pageTitle:"Đăng ký"
//     })
// }
// module.exports.registerPost = async (req,res)=>{
//     const {fullName,email,password,status} = req.body;
//     const existAccount= await AccountAdmin.findOne({
//         email:email
//     })
//     if(existAccount){
//         res.json({
//             code:"error",
//             message:"Email đã tồn tại trong hệ thống!"
//         })
//         return;
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password,salt);

//     const newAccount = new AccountAdmin({
//         fullName:fullName,
//         email:email,
//         password:hash,
//         status:"initial"
//     })

//     await newAccount.save();

//     const data = await AccountAdmin.findOne({
//         email:email
//     })
//     res.json({
//         code:"success",
//         message:"Đăng ký tài khoản thành công!"
//     })
// }
// module.exports.registerInitial = (req,res)=>{
//     res.render("admin/pages/register-initial",{
//         pageTitle:"Tài khoản đã được khởi tạo"
//     })
// }

module.exports.forgotPassword = (req,res)=>{
    res.render("admin/pages/forgot-password",{
        pageTitle:"Quên mật khẩu"
    })
}
module.exports.forgotPasswordPost = async (req,res) =>{
    const {email} = req.body;
    const existAccount = await AccountAdmin.findOne({
        email:email
    })
    if(!existAccount){
        res.json({
            code:"error",
            message:"Email không tồn tại trong hệ thống!"
        })
        return;
    }
    const exitsEmailForgotpassword = await ForgotPassword.findOne({
        email:email
    })
    if(exitsEmailForgotpassword)
    {
        res.json({
            code:"error",
            message:"Otp đã được gửi, vui lòng đợi 5 phút sau để gửi lại!"
        })
        return;
    }

    const otp = generateHelper.generateRandomNumber(6);
    const dataFinal = new ForgotPassword({
        email:email,
        otp:otp,
        expireAt: Date.now()+ 5*60*1000
    })
    await dataFinal.save();

    const subject = "Mã opt lấy lại mật khẩu"
    const content = `Mã otp của bạn là <b>${otp}</b>, vui lòng không chia sẻ cho bất kỳ ai!`
    mailerHelper.sendMail(email,subject,content)

    res.json({
        code:"success",
        message:"Đã gửi mã OTP qua email"
    })
}
module.exports.otpPassword = async (req,res)=>{
    const email = req.query.email
    const existOtp = await ForgotPassword.findOne({
        email:email
    })
    if(!existOtp) return res.redirect("/account/forgot-password");
    res.render("admin/pages/otp-password",{
        pageTitle:"Nhập mã OTP"
    })
}
module.exports.otpPasswordPost = async (req,res)=>{
    const {email,otp} = req.body;
    const existOtp = await ForgotPassword.findOne({
        email:email,
        otp:otp
    })
    if(!existOtp)
    {
        res.json({
            code:"error",
            message:"Xác thực otp thất bại"
        })
        return;
    }
    const token = jwt.sign(
        {
            id:existOtp.id,
            email:existOtp.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1d"
        }
    )
    res.cookie("token",token,{
        maxAge:24*60*60*1000,
        httpOnly:true,
        sameSite:"strict"
    })

    res.json({
        code:"success",
        message:"Xác thực otp thành công"
    })
}

module.exports.resetPassword = (req,res)=>{
    res.render("admin/pages/reset-password",{
        pageTitle:"Reset mật khẩu"
    })
}
module.exports.resetPasswordPost = async (req,res)=>{
   const { password } = req.body;
   const salt = await bcrypt.genSalt(10);
   const hash = await bcrypt.hash(password,salt);
    await AccountAdmin.updateOne({
        _id: req.account.id,
        status: "active"
    },{
        password : hash
    })
    res.json({
        code:"success",
        message:"Đổi mật khẩu thành công"
    })
}

module.exports.logoutPost = (req,res)=>{
    res.clearCookie("token");
    res.json({
        code:"success",
        message:"Đăng xuất thành công!"
    })
}


const mongoose = require("mongoose")
const schema = new mongoose.Schema(
    {   
        email: String,
        password:String,
        fullName:String,
        otp: String,
        expireAt : {
            type: Date,
            expires: 0
        }
    },
    {
        timestamps : true
    }
)
const Otp = mongoose.model("Otp",schema,"otp-register")
module.exports = Otp;
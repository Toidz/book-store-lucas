const mongoose = require("mongoose")
const schema = new mongoose.Schema(
    {   
        email: String,
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
const ForgotPasswordClient = mongoose.model("ForgotPasswordClient",schema,"forgot-password-client")
module.exports = ForgotPasswordClient;
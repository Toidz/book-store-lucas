const Joi = require("joi");
module.exports.bookPost =(req,res,next)=>{
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .messages({
                "string.empty":"Vui lòng nhập tên sách",
            }),
        produce:  Joi.string().allow(""),
        author:  Joi.string().allow(""),
        category:  Joi.string().allow(""),
        position:  Joi.string().allow(""),
        avatar:  Joi.string().allow(""),
        priceBook: Joi.string().allow(""),
        numberBook: Joi.string().allow(""),
        information:  Joi.string().allow(""),
    })
    const {error} = schema.validate(req.body);
    if(error)
    {
        const errorDetail = error.details[0].message;
        console.log(error);
        res.json({
            code:"error",
            message:errorDetail
        })
        return;
    }
    next();
}

module.exports.bookPatch =(req,res,next)=>{
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .messages({
                "string.empty":"Vui lòng nhập tên sách",
            }),
        produce:  Joi.string().allow(""),
        author:  Joi.string().allow(""),
        category:  Joi.string().allow(""),
        position:  Joi.string().allow(""),
        avatar:  Joi.string().allow(""),
        priceBook: Joi.string().allow(""),
        numberBook: Joi.string().allow(""),
        information:  Joi.string().allow(""),
        current: Joi.string().allow("")
    })
    const {error} = schema.validate(req.body);
    if(error)
    {
        const errorDetail = error.details[0].message;
        console.log(error);
        res.json({
            code:"error",
            message:errorDetail
        })
        return;
    }
    next();
}

const Joi = require("joi");

const validate = (schema, req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const errorDetail = error.details[0].message;
    console.log(error);
    res.json({
      code: "error",
      message: errorDetail,
    });
    return;
  }
  next();
};

module.exports.editPatch = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "Vui lòng nhập họ tên",
        "string.min": "Họ tên phải có ít nhất 5 ký tự!",
        "string.max": "Họ tên không được vượt quá 50 ký tự!",
      }),
    phone: Joi.string().allow(""),
    positionCompany: Joi.string().allow(""),
    avatar: Joi.string().allow(""),
  });
  validate(schema, req, res, next);
};

module.exports.changePasswordPatch = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) return helpers.error("password.uppercase");
        if (!/[a-z]/.test(value)) return helpers.error("password.lowercase");
        if (!/\d/.test(value)) return helpers.error("password.number");
        if (!/[@$!%*?&]/.test(value)) return helpers.error("password.special");
        return value;
      })
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu mới!",
        "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
        "password.uppercase": "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
        "password.lowercase": "Mật khẩu phải chứa ít nhất một chữ cái thường!",
        "password.number": "Mật khẩu phải chứa ít nhất một chữ số!",
        "password.special": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
      }),
  });
  validate(schema, req, res, next);
};

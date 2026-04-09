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

const passwordSchema = Joi.string()
  .min(8)
  .custom((value, helpers) => {
    if (!/[A-Z]/.test(value)) return helpers.error("password.uppercase");
    if (!/[a-z]/.test(value)) return helpers.error("password.lowercase");
    if (!/\d/.test(value)) return helpers.error("password.number");
    if (!/[@$!%*?&]/.test(value)) return helpers.error("password.special");
    return value;
  })
  .messages({
    "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
    "password.uppercase": "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
    "password.lowercase": "Mật khẩu phải chứa ít nhất một chữ cái thường!",
    "password.number": "Mật khẩu phải chứa ít nhất một chữ số!",
    "password.special": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
  });

module.exports.accountAdminCreatePost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().required().min(5).max(50).messages({
      "string.empty": "Vui lòng nhập họ tên",
      "string.min": "Họ tên phải có ít nhất 5 ký tự!",
      "string.max": "Họ tên không được vượt quá 50 ký tự!",
    }),
    email: Joi.string().required().email().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng!",
    }),
    password: passwordSchema.required().messages({
      "string.empty": "Vui lòng nhập mật khẩu!",
    }),
    role: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn vai trò",
    }),
    status: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn trạng thái",
    }),
    phone: Joi.string().allow(""),
    positionCompany: Joi.string().allow(""),
    avatar: Joi.string().allow(""),
  });
  validate(schema, req, res, next);
};

module.exports.accountAdminEditPatch = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().required().min(5).max(50).messages({
      "string.empty": "Vui lòng nhập họ tên",
      "string.min": "Họ tên phải có ít nhất 5 ký tự!",
      "string.max": "Họ tên không được vượt quá 50 ký tự!",
    }),
    email: Joi.string().required().email().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng!",
    }),
    password: passwordSchema.allow(""),
    role: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn vai trò",
    }),
    status: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn trạng thái",
    }),
    phone: Joi.string().allow(""),
    positionCompany: Joi.string().allow(""),
    avatar: Joi.string().allow(""),
  });
  validate(schema, req, res, next);
};

module.exports.accountClientEditPatch = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().required().min(5).max(50).messages({
      "string.empty": "Vui lòng nhập họ tên",
      "string.min": "Họ tên phải có ít nhất 5 ký tự!",
      "string.max": "Họ tên không được vượt quá 50 ký tự!",
    }),
    email: Joi.string().required().email().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng!",
    }),
    password: passwordSchema.allow(""),
    phone: Joi.string().allow(""),
    city: Joi.string().allow(""),
    district: Joi.string().allow(""),
    ward: Joi.string().allow(""),
    street: Joi.string().allow(""),
  });
  validate(schema, req, res, next);
};

const roleSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Vui lòng nhập tên nhóm quyền",
  }),
  description: Joi.string().allow(""),
  permissions: Joi.array().items(Joi.string()).optional(),
});

module.exports.roleCreatePost = (req, res, next) => {
  validate(roleSchema, req, res, next);
};

module.exports.roleEditPatch = (req, res, next) => {
  validate(roleSchema, req, res, next);
};

module.exports.websiteInfoPatch = (req, res, next) => {
  const schema = Joi.object({
    websiteName: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    email: Joi.string().email().allow("").messages({
      "string.email": "Email không đúng định dạng!",
    }),
    address: Joi.string().allow(""),
    logo: Joi.string().allow(""),
    favicon: Joi.string().allow(""),
  });
  validate(schema, req, res, next);
};

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

const eventSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      "string.empty": "Vui lòng nhập tên sự kiện",
    }),
  discount: Joi.string().allow(""),
  avatar: Joi.string().allow(""),
  startDate: Joi.date()
    .required()
    .messages({
      "any.required": "Vui lòng nhập ngày bắt đầu",
      "date.base": "Ngày bắt đầu không hợp lệ",
    }),
  endDate: Joi.date()
    .required()
    .messages({
      "any.required": "Vui lòng nhập ngày kết thúc",
      "date.base": "Ngày kết thúc không hợp lệ",
    }),
  information: Joi.string().allow(""),
  status: Joi.string().allow(""),
});

module.exports.eventPost = (req, res, next) => {
  validate(eventSchema, req, res, next);
};

module.exports.eventPatch = (req, res, next) => {
  validate(eventSchema, req, res, next);
};

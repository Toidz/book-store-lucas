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

const newSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      "string.empty": "Vui lòng nhập tiêu đề bài viết",
    }),
  content: Joi.string()
    .required()
    .messages({
      "string.empty": "Vui lòng nhập nội dung bài viết",
    }),
  position: Joi.string().allow(""),
  avatar: Joi.string().allow(""),
});

module.exports.newPost = (req, res, next) => {
  validate(newSchema, req, res, next);
};

module.exports.newPatch = (req, res, next) => {
  validate(newSchema, req, res, next);
};

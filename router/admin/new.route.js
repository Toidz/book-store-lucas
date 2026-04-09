const router = require("express").Router();
const newController = require("../../controllers/admin/new.controller");
const newValidate = require("../../validates/admin/new.validate");
const cloudinaryHelper = require("../../helpers/cloudinary.helper")
const multer  = require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
router.get("/list",newController.list);

router.get("/create",newController.create);

router.post("/create",
    upload.single('avatar'),
    newValidate.newPost,
    newController.createPost)

router.patch("/changePatch",newController.changePatch)

router.get("/edit/:id",newController.edit) 

router.patch(
    "/edit/:id",
    upload.single('avatar'),
    newValidate.newPatch,
    newController.editPatch) 

router.patch("/delete/:id",newController.deletePatch)

module.exports = router;
const router = require("express").Router();
const eventController = require("../../controllers/admin/event.controller");
const eventValidate = require("../../validates/admin/event.validate");
const cloudinaryHelper = require("../../helpers/cloudinary.helper")
const multer  = require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
router.get("/list",eventController.list);
router.get("/create",eventController.create);
router.post("/create",
    upload.single('avatar'),
    eventValidate.eventPost,
    eventController.createPost)
router.get("/edit/:id",eventController.edit) 
router.patch(
    "/edit/:id",
    upload.single('avatar'),
    eventValidate.eventPatch,
    eventController.editPatch) 
router.patch("/delete/:id",eventController.deletePatch)

module.exports = router;
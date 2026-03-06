const router = require("express").Router();
const eventController = require("../../controllers/admin/event.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper")
const multer  = require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
router.get("/list",eventController.list);
router.get("/create",eventController.create);
router.post("/create",
    upload.single('avatar'),
    eventController.createPost)
router.get("/edit/:id",eventController.edit) 
router.patch(
    "/edit/:id",
    upload.single('avatar'),
    eventController.editPatch) 
router.patch("/delete/:id",eventController.deletePatch)

module.exports = router;
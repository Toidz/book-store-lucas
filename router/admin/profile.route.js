const router = require("express").Router();
const profileController = require("../../controllers/admin/profile.controller");
const profileValidate = require("../../validates/admin/profile.validate");
const multer = require("multer")
const cloudinaryHelper = require("../../helpers/cloudinary.helper")
const reload = multer({ storage: cloudinaryHelper.storage });
router.get("/edit",profileController.edit);
router.patch("/edit/:id",
    reload.single('avatar'),
    profileValidate.editPatch,
    profileController.editPatch);

router.get("/change-password",profileController.changePassword);
router.patch("/change-password",profileValidate.changePasswordPatch,profileController.changePasswordPatch);
module.exports = router;
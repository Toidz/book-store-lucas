const router = require("express").Router();
const multer  = require('multer')
const cloudinaryHelper = require("../../helpers/cloudinary.helper") 
const upload = multer({ storage: cloudinaryHelper.storage});
const categoryController = require("../../controllers/admin/category.controller");
router.get("/list",categoryController.list);
router.patch("/list",categoryController.listPatch);

router.get("/create",categoryController.create);
router.post("/create",
    upload.single('avatar'),
    categoryController.createPost
);


router.get("/edit/:id",categoryController.edit);

router.patch(
    "/edit/:id",
    upload.single('avatar'),
    categoryController.editPatch
);

router.patch(
    "/delete/:id",
    categoryController.deletePatch
);


module.exports = router;
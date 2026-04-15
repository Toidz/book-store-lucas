const router = require("express").Router();
const bookController = require("../../controllers/admin/book.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper")
const multer  = require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
const bookValidate = require("../../validates/admin/book.validate")
router.get("/list",bookController.list);

router.get("/create",bookController.create);

router.post("/create",
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]), 
    bookValidate.bookPost,
    bookController.createPost)

router.patch("/changePatch",bookController.changePatch)

router.get("/edit/:id",bookController.edit) 

router.patch(
    "/edit/:id",
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    bookValidate.bookPatch,
    bookController.editPatch) 

router.patch("/delete/:id",bookController.deletePatch)

router.get("/trash",bookController.trash);
router.patch("/trash",bookController.trashMulti)
router.patch("/restore/:id",bookController.restore)
router.patch("/destroy/:id",bookController.destroy)
router.get("/export-excel",bookController.exportExcel)

module.exports = router;
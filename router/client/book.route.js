const router = require("express").Router();
const bookController= require("../../controllers/client/book.controller");

router.get("/:slug",bookController.book);

router.get("/detail/:slug",bookController.detail);
router.post("/comment/:idBook",bookController.commentPost);
router.patch("/comment/edit/:idComment",bookController.commentEditPatch);
module.exports = router;

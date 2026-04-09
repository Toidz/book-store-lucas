const router = require("express").Router();
const commentController = require("../../controllers/admin/comment.controller");

router.get("/list", commentController.list);
router.patch("/approve/:id", commentController.approvePatch);
router.patch("/delete/:id", commentController.deletePatch);

module.exports = router;

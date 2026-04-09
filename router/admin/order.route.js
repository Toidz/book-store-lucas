const router = require("express").Router();
const orderController = require("../../controllers/admin/order.controller");
router.get("/list",orderController.list);
router.get("/export-excel",orderController.exportExcel);
router.get("/edit/:code",orderController.edit);
router.patch("/edit/:code",orderController.editPatch);
router.patch("/delete/:code",orderController.deletePatch);

module.exports = router;
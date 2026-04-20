const router = require("express").Router();
const orderHistoryController = require("../../controllers/client/order-history.controller");
router.get("/",orderHistoryController.list);
router.get("/detail",orderHistoryController.detail);
router.patch("/cancel/:id",orderHistoryController.cancel);
module.exports = router;
 
const router = require("express").Router();
const saleController= require("../../controllers/client/sale.controller");
router.get("/:slug",saleController.sale);

module.exports = router;

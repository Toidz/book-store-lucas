const router = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");
router.get("/",dashboardController.dashboard);
router.get("/inventory",dashboardController.inventory)
router.post("/revenueChart",dashboardController.revenueChart);
router.get("/export-excel", dashboardController.exportExcel);
module.exports = router;
const router = require("express").Router();
const accountController = require("../../controllers/client/account.controller");
const authMidderWare = require("../../middlewares/client/auth.middleware")

router.get("/login",accountController.login);
router.post("/login",accountController.loginPost);

router.get("/register",accountController.register);
router.post("/otp-register",accountController.otpRegister);
router.get("/verify-otp",accountController.verifyOtp)
router.post("/verify-otp",accountController.verifyOtpPost);


router.get("/forgot-password",accountController.forgotPassword);
router.post("/forgot-password",accountController.forgotPasswordPost);

router.get("/otp-password",accountController.otpPassword);
router.post("/otp-password",accountController.otpPasswordPost);

router.get("/reset-password",accountController.resetPassword);
router.post("/reset-password",authMidderWare.verifyToken,accountController.resetPasswordPost);

router.get("/logout",accountController.logout);
module.exports = router;
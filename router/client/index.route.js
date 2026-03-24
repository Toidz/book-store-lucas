const jwt = require('jsonwebtoken');
const router = require("express").Router();
const bookRouter = require("./book.route");
const homeRouter = require("./home.route");
const cartRouter = require("./cart.route");
const contactRouter = require("./contact.route")
const infoMiddleware = require("../../middlewares/client/infowebsite.middleware")
const categoryMiddleware = require("../../middlewares/client/category.middleware")
const searchRouter = require("./seach.route")
const orderRouter = require("./order.route")
const newRouter = require("./new.route")
const contactClientRouter = require("./contactClient.route")
const policyServiceRouter = require("./policyService.route")
const accountRouter = require("./account.route")
const AccountClient = require("../../models/account-client.model")
const infoUserRouter = require("./infoUser.route")
const authMiddleWareClient = require("../../middlewares/client/auth.middleware")
const payRouter = require(("./pay.route"))
const orderHistoryRouter = require("./order-history.route")
const chatRouter = require("./chat.route")
const saleRouter = require("./sale.route")
const websiteInfoMiddleware = require("../../middlewares/admin/setting-info.middleware");
router.use(infoMiddleware.info)
router.use(categoryMiddleware.category)
router.use("/book",bookRouter);
router.use("/",homeRouter);
router.use("/cart",authMiddleWareClient.verifyToken,cartRouter);
router.use("/pay",authMiddleWareClient.verifyToken,payRouter);
router.use("/contact",contactRouter);
router.use("/search",searchRouter);
router.use("/order",authMiddleWareClient.verifyToken,orderRouter);
router.use("/new",newRouter);
router.use("/contact-client",contactClientRouter);
router.use("/policy-service",policyServiceRouter);
router.use("/account",websiteInfoMiddleware,accountRouter);
router.use("/info-user",authMiddleWareClient.verifyToken,infoUserRouter);
router.use("/order-history",authMiddleWareClient.verifyToken,orderHistoryRouter);
router.use("/api/chat", chatRouter);
router.use("/sale", saleRouter);
router.post("/api/auth/verify",async (req,res) =>{
    try {
        const token = req.cookies.tokenUser;
        const decoded = jwt.verify(token,process.env.JWT_SECRET_CLIENT);
        const {email} = decoded;
        const existAccount = await AccountClient.findOne({
            email:email
        })
        req.account = existAccount;
        res.locals.account = existAccount;
        res.json({
            code:"success",
        })
   } catch (error) {
        res.json({
            code:"error",
        })
   }
});

module.exports = router;

const router = require("express").Router()
const chatController = require("../../controllers/client/chat.controller")
router.post("/send", chatController.chat);
module.exports= router
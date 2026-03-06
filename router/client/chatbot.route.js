const router = require("express").Router()
const chatBotController = require("../../controllers/client/chatBot.controller.js")
router.post("/api/chat-bot", chatBotController.chatBot);
module.exports= router
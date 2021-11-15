const express = require('express');
const { getChat, indChat } = require('../controllers/chatController');
const router = express.Router();


router.get('/getChats', getChat);
router.post('/ind-chat', indChat);

module.exports = router; 
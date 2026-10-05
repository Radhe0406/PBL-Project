const router = require('express').Router();
const { auth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/', auth, messageController.sendMessage);
router.get('/conversations', auth, messageController.getConversations);
router.get('/conversations/:conversationId', auth, messageController.getMessages);
router.put('/:messageId/read', auth, messageController.markAsRead);

module.exports = router;

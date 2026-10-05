const router = require('express').Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getNotifications);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.put('/:notificationId/read', auth, notificationController.markAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);

module.exports = router;

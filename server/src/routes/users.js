const router = require('express').Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

router.get('/:userId', userController.getUserProfile);
router.put('/:userId', auth, userController.updateProfile);
router.post('/:userId/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.get('/:userId/ratings', userController.getUserRatings);
router.get('/:userId/impact', userController.getUserImpact);
router.get('/:userId/favorites', auth, userController.getUserFavorites);

module.exports = router;

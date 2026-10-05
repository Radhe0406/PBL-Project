const router = require('express').Router();
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', auth, reviewController.createReview);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;

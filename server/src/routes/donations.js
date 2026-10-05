const router = require('express').Router();
const { auth } = require('../middleware/auth');
const donationController = require('../controllers/donationController');

router.post('/', auth, donationController.createRequest);
router.get('/:donationId', auth, donationController.getDonation);
router.put('/:donationId', auth, donationController.updateDonation);

module.exports = router;

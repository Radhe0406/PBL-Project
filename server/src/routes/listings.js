const router = require('express').Router();
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const listingController = require('../controllers/listingController');

router.get('/', listingController.getListings);
router.get('/search', listingController.searchListings);
router.get('/:listingId', listingController.getListingById);
router.post('/', auth, upload.array('images', 10), listingController.createListing);
router.put('/:listingId', auth, upload.array('images', 10), listingController.updateListing);
router.delete('/:listingId', auth, listingController.deleteListing);
router.post('/:listingId/favorite', auth, listingController.toggleFavorite);
router.post('/:listingId/report', auth, listingController.reportListing);

module.exports = router;

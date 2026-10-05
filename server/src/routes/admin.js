const router = require('express').Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const adminController = require('../controllers/adminController');
const exchangeController = require('../controllers/exchangeController');
const donationController = require('../controllers/donationController');

// All admin routes require auth + admin role
router.use(auth, admin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.get('/listings', adminController.getAdminListings);
router.put('/listings/:listingId', adminController.updateAdminListing);
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId', adminController.updateReport);

module.exports = router;

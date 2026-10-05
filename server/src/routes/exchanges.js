const router = require('express').Router();
const { auth } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

router.post('/', auth, exchangeController.createProposal);
router.get('/:proposalId', auth, exchangeController.getProposal);
router.put('/:proposalId', auth, exchangeController.updateProposal);

module.exports = router;

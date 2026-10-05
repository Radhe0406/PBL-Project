const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, authController.login);

router.post('/refresh', authController.refreshToken);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

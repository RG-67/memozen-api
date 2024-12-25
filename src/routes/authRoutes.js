const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');


const router = express.Router();

router.use(authMiddleware, express.json());

router.post('/register', register);
router.post('/login', login);


module.exports = router;


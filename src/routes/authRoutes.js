const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');
const upload = require('../config/multer');


const router = express.Router();


router.post('/register', upload.single('image'), authMiddleware, register);
router.post('/login', authMiddleware, login);




module.exports = router;
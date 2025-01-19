const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');
const upload = require('../config/multer');


const router = express.Router();

router.use(authMiddleware, express.json());

router.post('/register', upload.single('image'), register);
router.post('/login', login);


module.exports = router;


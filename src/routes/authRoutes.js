const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');
const upload = require('../config/multer');


const router = express.Router();


// router.post('/register', upload.single('file'), authMiddleware, register);
router.post('/register', (req, res, next) => {
    console.log("Upload middleware triggered");
    next();
}, upload.single('file'), (req, res) => {
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    res.status(200).json({ status: true, message: "File uploaded" });
}, register);
router.post('/login', authMiddleware, login);


module.exports = router;


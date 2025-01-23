const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');
const { createGroup } = require('../controllers/groupController');


const router = express.Router();



router.post('/createGroup', upload.single('image'), authMiddleware, createGroup);



module.exports = router;
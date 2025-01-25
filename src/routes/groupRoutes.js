const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');
const { createGroup, getGroupByUserId } = require('../controllers/groupController');



const router = express.Router();



router.post('/createGroup', upload.single('image'), authMiddleware, createGroup);
router.get('/getGroupByUserId/:userId', authMiddleware, getGroupByUserId);



module.exports = router;
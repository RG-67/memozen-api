const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');
const { createGroup, getGroupByUserId, getGroupUsersByGroupId } = require('../controllers/groupController');



const router = express.Router();



router.post('/createGroup', upload.single('image'), authMiddleware, createGroup);
router.get('/getGroupByUserId/:userId', authMiddleware, getGroupByUserId);
router.get('/getGroupByGroupId/:groupId', authMiddleware, getGroupUsersByGroupId);



module.exports = router;
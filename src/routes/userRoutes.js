const authMiddleware = require('../middlewares/authMiddleware');
const {getUserProfile, updateUserProfile} = require('../controllers/userController');
const express = require('express');
const router = express.Router();


router.use(authMiddleware, express.json());

router.get('/:userid', getUserProfile);
router.put('/:userid', updateUserProfile);





module.exports = router;
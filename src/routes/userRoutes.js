const authMiddleware = require('../middlewares/authMiddleware');
const {getUserProfile, updateUserProfile, getAllUsers} = require('../controllers/userController');
const express = require('express');
const router = express.Router();


router.use(authMiddleware, express.json());

router.get('/getAllUsers', getAllUsers);
router.get('/:userid', getUserProfile);
router.put('/:userid', updateUserProfile);





module.exports = router;
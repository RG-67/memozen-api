const {createNote, getNotes, updateNote, deleteNote} = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();

router.use(authMiddleware, express.json());


router.post('/createNote', createNote);
router.get('/getNote', getNotes);
router.put('/updateNote', updateNote);
router.delete('/deleteNote', deleteNote);



module.exports = router;
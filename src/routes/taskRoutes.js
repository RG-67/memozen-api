const {createTask, updateTask} = require('../controllers/taskController');
const express = require('express');
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');


router.use(authMiddleware, express.json());


router.post('/create', createTask);
router.post('/update', updateTask);


module.exports = router;
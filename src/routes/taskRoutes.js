const {createTask, getTasks, updateTask, deleteTask, getGroupTask, getTaskById} = require('../controllers/taskController');
const express = require('express');
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');


router.use(authMiddleware, express.json());


router.post('/create', createTask);
router.get('/getTask', getTasks);
router.post('/update', updateTask);
router.delete('/deleteTask', deleteTask);
router.get('/getGroupTask', getGroupTask);
router.get('/getTaskById', getTaskById);


module.exports = router;
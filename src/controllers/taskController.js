const db = require('../config/db');



const createTask = async (req, res) => {
    try {
        const { userid, title, description, deadline, priority, category, status } = req.body;
        const getTaskId = await db.query('SELECT prefix || middle || suffix AS task_id FROM task_id_sequence WHERE id = $1', [1]);
        const taskId = getTaskId.rows[0]?.task_id;
        await db.query('UPDATE task_id_sequence SET suffix = suffix + 1 WHERE id = $1', [1]);
        const response = await db.query('INSERT INTO tasks (taskid, userid, title, description, deadline, priority, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', 
            [taskId, userid, title, description, deadline, priority, category, status]);
        res.status(201).json({ status: true, message: "Task successfully created", data: response.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}


const updateTask = async (req, res) => {
    try {
        const { userid, taskid } = req.query;
        const { title, description, deadline, priority, category, status } = req.body;
        const response = await db.query('UPDATE tasks SET title = $1, description = $2, deadline = $3, priority = $4, category = $5, status = $6 WHERE taskid = $7 AND userid = $8 RETURNING *', 
            [title, description, deadline, priority, category, status, taskid, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No task found', data: {} });
        }
        res.status(200).json({ status: true, message: "Task successfully updated", data: response.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}




module.exports = { createTask, updateTask };
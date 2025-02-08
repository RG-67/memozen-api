const db = require('../config/db');
const scheduleReminder = require('../services/scheduleReminder');



const createTask = async (req, res) => {
    try {
        const { userid, title, description, deadline, priority, category, status, reminder, deviceToken } = req.body;
        const getTaskId = await db.query('SELECT prefix || middle || suffix AS task_id FROM task_id_sequence WHERE id = $1', [1]);
        const taskId = getTaskId.rows[0]?.task_id;
        await db.query('UPDATE task_id_sequence SET suffix = suffix + 1 WHERE id = $1', [1]);
        await db.query('INSERT INTO tasks (taskid, userid, title, description, deadline, priority, category, status, reminderm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [taskId, userid, title, description, deadline, priority, category, status, reminder]);

        if (reminder !== null && reminder !== "") {
            scheduleReminder(deviceToken, title, description, new Date(reminder));
        }

        res.status(201).json({ status: true, message: "Task successfully created", data: {} });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}


const getTasks = async (req, res) => {
    try {
        const { userid } = req.query;
        const response = await db.query(`SELECT taskid, title, description, deadline, priority, category, status, reminder, 
                                         to_Char(created_at::timestamp, 'HH12:MI AM') AS "createTime", percentage
                                         FROM tasks WHERE userid = $1 and "isGroup" is null ORDER BY id asc`,
            [userid]);
        res.status(200).json({ status: true, message: "Tasks successfully retrieved", totalTasks: response.rowCount, data: response.rows });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}


const updateTask = async (req, res) => {
    try {
        const { userid, taskid } = req.query;
        const { title, description, deadline, priority, category, status } = req.body;
        const response = await db.query('UPDATE tasks SET title = $1, description = $2, deadline = $3, priority = $4, category = $5, status = $6, updated_at = LOCALTIMESTAMP WHERE taskid = $7 AND userid = $8 RETURNING *',
            [title, description, deadline, priority, category, status, taskid, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No task found', data: {} });
        }
        const result = await db.query(`Select row_to_json(t)::jsonb - 'id' - 'created_at' - 'updated_at' as result from (Select * from tasks where taskid = $1 and userid = $2)t`, [taskid, userid]);
        res.status(200).json({ status: true, message: "Task successfully updated", data: result.rows[0].result });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}

const deleteTask = async (req, res) => {
    try {
        const { userid, taskid } = req.query;
        const response = await db.query('DELETE FROM tasks WHERE taskid = $1 AND userid = $2 RETURNING *', [taskid, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No task found', data: {} });
        }
        res.status(200).json({ status: true, message: "Task successfully deleted", data: {} });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}


const getGroupTask = async (req, res) => {
    try {
        const { userid } = req.query;
        const query = `SELECT group_id,t.taskid,t.title,t.description,t.category,t.status,t.percentage,1 as tasks
                       FROM group_members gm JOIN tasks t ON gm.group_id = t.groupid WHERE gm.userid = $1 and "isGroup" = $2`;
        const response = await db.query(query, [userid, 1]);
        if (response) {
            return res.status(200).json({ status: true, message: 'Data successfully retreived', totalGroupTasks: response.rowCount, data: response.rows });
        }
        return res.status(200).json({ status: true, message: 'Data not foumd', data: [] });
    } catch (error) {
        return res.status(500).json({ status: true, message: 'Internal server error', data: [] });
    }
}




module.exports = { createTask, getTasks, updateTask, deleteTask, getGroupTask };
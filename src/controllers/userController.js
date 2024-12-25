const pool = require('../config/db');






const getUsers = async (req, res) => {
    try {
        const response = await pool.query('SELECT id, userid, username, email FROM users');
        if (response.rows.length === 0) {
            return res.status(404).json({status: false, message: 'No users found', data: []});
        }
        res.status(200).json({status: true, message: "Data successfully retrieved", data: response.rows});
    } catch (e) {
        res.status(500).json({status: false, message: 'Internal server error', data: []});
        console.error(e);
    }
}

module.exports = { getUsers };
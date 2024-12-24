const pool = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM users');
        console.log(response.rows);
        res.status(200).json(response.rows);
    } catch (e) {
        console.error(e);
    }
}

module.exports = { getUsers };
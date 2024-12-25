const db = require('../config/db');
const { setPassword, comparePassword } = require('../utils/authConstants');



const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const pass = await setPassword(password);
        const result = await db.query('SELECT prefix || middle || suffix AS user_id FROM user_id_sequence where id = $1', [1]);
        const userId = result.rows[0]?.user_id;
        await db.query('Update user_id_sequence set suffix = suffix + 1 where id = $1', [1]);
        const response = await db.query('INSERT INTO users (userid, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, username, email, pass]);
        res.status(201).json({ status: true, message: "User successfully registered", data: response.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const dbPassword = await db.query('SELECT password FROM users WHERE email = $1', [email]);
        const pass = await comparePassword(password, dbPassword.rows[0]?.password);
        if (pass) {
            const response = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            res.status(200).json({ status: true, message: "User successfully logged in", data: response.rows[0] });
        } else {
            res.status(404).json({ status: false, message: 'Invalid email or password', data: {} });
        }
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}


module.exports = { register, login };
const db = require('../config/db');
const { setPassword, comparePassword } = require('../utils/authConstants');
const { uploadImage } = require('../services/imageService');
const fs = require('fs');



const register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const checkEmailExist = await db.query('SELECT email FROM users WHERE email = $1', [email]);
        const checkPhoneExist = await db.query('SELECT phone FROM users WHERE phone = $1', [phone]);
        if (checkEmailExist.rows.length > 0) {
            res.status(400).json({ status: false, message: 'Email already exist', data: {} });
            return;
        }
        if (checkPhoneExist.rows.length > 0) {
            res.status(400).json({ status: false, message: 'Phone number already exist', data: {} });
            return;
        }
        const pass = await setPassword(password);
        const result = await db.query('SELECT prefix || middle || suffix AS user_id FROM user_id_sequence where id = $1', [1]);
        const userId = result.rows[0]?.user_id;

        let imagePath, imgID;
        if (req.file) {
            const filePath = req.file.path;
            if (filePath) {
                [imagePath, imgID] = await uploadImage(filePath);
                try {
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete file at ${filePath}:`, error);
                }
            }
        }
        await db.query('Update user_id_sequence set suffix = suffix + 1 where id = $1', [1]);
        await db.query('INSERT INTO users (userid, username, email, password, phone, userimage, imageid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, username, email, pass, phone, imagePath, imgID]);
        const userResult = await db.query('SELECT userid, username, email, phone FROM users WHERE email = $1 AND phone = $2 AND username = $3', [email, phone, username]);
        res.status(200).json({ status: true, message: "User successfully registered", data: userResult.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await db.query(`SELECT type, userid, username, email, phone, userimage FROM users WHERE email = $1`, [email]);
        if (response.rows.length === 0) {
            res.status(404).json({ status: false, message: 'Invalid email', data: {} });
            return;
        }
        const dbPassword = await db.query('SELECT password FROM users WHERE email = $1', [email]);
        if (response.rows[0]?.type === "Member") {
            const pass = await comparePassword(password, dbPassword.rows[0]?.password);
            if (!pass) {
                res.status(404).json({ status: false, message: 'Invalid password', data: {} });
                return;
            }
        } else {
            if (dbPassword.rows[0].password !== password) {
                res.status(404).json({ status: false, message: 'Invalid password', data: {} });
                return;
            }
        }
        res.status(200).json({ status: true, message: "User successfully logged in", data: response.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}



module.exports = { register, login };
const db = require('../config/db');



const getUserProfile = async (req, res) => {
    try {
        const { userid } = req.params;
        const response = await db.query('SELECT id, userid, username, email FROM users where userid = $1', [userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No users found', data: {} });
        }
        res.status(200).json({ status: true, message: "Data successfully retrieved", data: response.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { userid } = req.params;
        const { username, email, phone } = req.body;
        const checkEmail = await db.query('SELECT email FROM users WHERE email = $1 and userid <> $2', [email, userid]);
        const checkPhone = await db.query('SELECT phone FROM users WHERE phone = $1 and userid <> $2', [phone, userid]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ status: false, message: 'Email already exist', data: {} });
        }
        if (checkPhone.rows.length > 0) {
            return res.status(400).json({ status: false, message: 'Phone number already exist', data: {} });
        }
        const response = await db.query('UPDATE users SET username = $1, email = $2, phone = $3, updated_at = LOCALTIMESTAMP WHERE userid = $4 RETURNING *',
            [username, email, phone, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No users found', data: {} });
        }
        const result = await db.query('SELECT username, email, phone FROM users WHERE userid = $1', [userid]);
        res.status(200).json({ status: true, message: "Data successfully updated", data: result.rows[0] });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}


const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(`SELECT u.userid, u.username, u.userimage, gm.group_id, g.group_name FROM users u LEFT JOIN group_members gm
        ON u.userid=gm.userid LEFT JOIN groups g ON g.group_id=gm.group_id WHERE u.type=$1`, ['Member']);
        if (result.rows.length === 0) {
            return res.status(200).json({ status: false, message: 'Users not found', data: [] });
        }
        const groupedUsers = {};
        result.rows.forEach(user => {
            if (!groupedUsers[user.userid]) {
                groupedUsers[user.userid] = {
                    userid: user.userid,
                    username: user.username,
                    userimage: user.userimage,
                    groups: []
                };
            }

            const alreadyExists = groupedUsers[user.userid].groups.some(g => g.group_id === user.group_id);

            if (!alreadyExists && user.group_id) {
                groupedUsers[user.userid].groups.push({
                    groupId: user.group_id,
                    groupName: user.group_name
                });
            }
        });

        const userInMultiGroups = Object.values(groupedUsers);
        return res.status(200).json({ status: true, message: 'Data successfully retrieved', data: userInMultiGroups });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(error);
    }
}


module.exports = { getUserProfile, updateUserProfile, getAllUsers };
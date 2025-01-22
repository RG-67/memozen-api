const db = require('../config/db');
const { uploadImage } = require('../services/imageService');
const fs = require('fs');


const createGroup = async (req, res) => {
    try {
        const { groupname, userid } = req.body;
        let imagePath, imageId;
        if (req.file) {
            const filePath = req.file.path;
            if (filePath) {
                [imagePath, imageId] = await uploadImage(filePath);
                fs.promises.unlink(filePath);
            }
        }
        await db.query('BEGIN');
        const groupId = await db.query("SELECT prefix || middle || suffix AS group_id from where id = $1", [1]);
        const insertQuery = await db.query("INSERT INTO group_members(group_id, userid) VALUES($1, $2) RETURNING *", [groupId, userid]);
        
    } catch (error) {

    }
}









module.exports = { createGroup };
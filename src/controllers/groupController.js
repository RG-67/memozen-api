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
        const insertGroupMembers = "INSERT INTO group_members(group_id, userid) VALUES($1, $2) ON CONFLICT(group_id, userid) DO NOTHING";
        const insertGroups = await db.query("INSERT INTO groups(group_id, group_name, group_image, group_imageid) values($1, $2, $3, $4)", [groupId, groupname, imagePath, imageId]);
        for(const users in userid) {
            await db.query(insertGroupMembers, [groupId, users]);
        }
        await db.query("COMMIT");
    } catch (error) {
        await db.query("ROLLBACK");
    }
}









module.exports = { createGroup };
const { raw } = require('express');
const db = require('../config/db');
const { uploadImage, uploadGroupImage } = require('../services/imageService');
const fs = require('fs');


const createGroup = async (req, res) => {
    try {
        const { groupname, userid: rawUserIds } = req.body;
        const userid = typeof rawUserIds === "string" ? JSON.parse(rawUserIds) : rawUserIds;
        let imagePath, imageId;
        if (req.file) {
            const filePath = req.file.path;
            if (filePath) {
                try {
                    [imagePath, imageId] = await uploadImage(filePath);
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete temporary file: ${filePath}`, error);
                }
            }
        }
        await db.query('BEGIN');
        const groupIdResult = await db.query("SELECT prefix || middle || suffix AS group_id from group_id_sequence where id = $1", [1]);
        const groupId = groupIdResult.rows[0].group_id;
        const insertGroupMembers = "INSERT INTO group_members(group_id, userid) VALUES($1, $2) ON CONFLICT(group_id, userid) DO NOTHING";
        const insertGroups = await db.query("INSERT INTO groups(group_id, group_name, group_image, group_imageid) values($1, $2, $3, $4) RETURNING *", [groupId, groupname, imagePath, imageId]);
        for (const users of userid) {
            await db.query(insertGroupMembers, [groupId, users]);
        }
        await db.query("UPDATE group_id_sequence set suffix = suffix + 1 where id = $1", [1]);
        await db.query("COMMIT");
        res.status(200).json({ status: true, message: "Group created successfully", data: insertGroups.rows[0] });
    } catch (error) {
        await db.query("ROLLBACK");
        res.status(500).json({ status: false, message: "Failed to create group", data: {} });
        console.error("Group creation failed ==>", error);
    }
}









module.exports = { createGroup };
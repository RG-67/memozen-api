const { raw } = require('express');
const db = require('../config/db');
const { uploadImage, uploadGroupImage } = require('../services/imageService');
const fs = require('fs');


const createGroup = async (req, res) => {
    try {
        const { adminid, groupname, userid: rawUserIds } = req.body;
        const userid = typeof rawUserIds === "string" ? JSON.parse(rawUserIds) : rawUserIds;
        let imagePath, imageId;
        if (req.file) {
            const filePath = req.file.path;
            if (filePath) {
                try {
                    [imagePath, imageId] = await uploadGroupImage(filePath);
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
        const insertGroups = await db.query("INSERT INTO groups(group_id, group_name, group_image, group_imageid, adminid) values($1, $2, $3, $4, $5) RETURNING *", [groupId, groupname, imagePath, imageId, adminid]);
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


const getGroupByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `select g.group_name as "groupName",
                       g.group_id AS "groupID",
                       g.group_image AS "groupImage",
                       g.group_imageid AS "groupImageID",
                       u.userid AS "userID",
                       u.username AS "userName",
                       u.userimage AS "userImage",
                       u.imageid AS "userImageID" 
                       FROM groups g JOIN group_members gm 
                       ON g.group_id = gm.group_id JOIN users u on u.userid = gm.userid
                       WHERE g.group_id in(SELECT group_id from group_members WHERE userid = $1) ORDER BY g.group_id, u.userid`;

        const groupId = await db.query("SELECT group_id from group_members where userid = $1", [userId]);
        const groupResult = await db.query("SELECT adminid, group_image, group_imageid, group_name from groups where group_id = $1", [groupId.rows[0].group_id]);
        if (groupResult) {
            const result = await db.query("SELECT group_members.userid,users.username,users.userimage,users.imageid,users.phone from group_members INNER JOIN users on group_members.userid=users.userid where group_members.group_id=$1", [groupId.rows[0].group_id]);
            return res.status(200).json({ status: true, message: "Data successfully retreived", data: result.rows });
        }
        return res.status(200).json({ status: true, message: "Data not found", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", data: [] });
        console.error("Data retreived failed ==>", error);
    }
}




module.exports = { createGroup, getGroupByUserId };
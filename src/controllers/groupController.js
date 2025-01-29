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
        let totalRooms = 0;
        const query = `select 
                       (select count(*) from group_members where userid = $1) AS "totalRooms",
                       g.group_name AS "groupName",
                       g.group_id AS "groupID",
                       g.group_image AS "groupImage",
                       g.group_imageid AS "groupImageID",
                       u.userid AS "userID",
                       u.username AS "userName",
                       u.userimage AS "userImage",
                       u.imageid AS "userImageID" ,
                       u.phone AS "userPhone"
                       FROM groups g JOIN group_members gm
                       ON g.group_id = gm.group_id JOIN users u on u.userid = gm.userid
                       WHERE g.group_id IN(SELECT group_id FROM group_members WHERE userid = $1) ORDER BY g.group_id, u.userid`;
        const queryRes = await db.query(query, [userId]);
        const groupData = queryRes.rows.reduce((acc, row) => {
            const grpIndex = acc.findIndex(g => g.groupId === row.groupID);
            totalRooms = row.totalRooms;
            const userData = {
                userId: row.userID,
                userName: row.userName,
                userPhone: row.userPhone,
                userImage: row.userImage,
                userImageId: row.userImageID
            };
            if (grpIndex === -1) {
                acc.push({
                    groupId: row.groupID,
                    groupName: row.groupName,
                    groupImage: row.groupImage,
                    groupImageId: row.groupImageID,
                    groupMemberCount: 1,
                    groupData: [userData]
                });
            } else {
                acc[grpIndex].groupMemberCount += 1;
                acc[grpIndex].groupData.push(userData);
            }
            return acc;
        }, []);
        if (groupData.length > 0) {
            return res.status(200).json({ status: true, message: "Data successfully retreived", totalRooms: totalRooms, data: groupData });
        }
        return res.status(200).json({ status: true, message: "Data not found", totalRooms: totalRooms, data: [] });
    } catch (error) {
        res.status(500).json({ status: false, totalRooms: totalRooms, message: "Server error", data: [] });
        console.error("Data retreived failed ==>", error);
    }
}



const getGroupUsersByGroupId = async (req, res) => {
    try {
        const { groupId } = req.params;
        const query = `SELECT 
                       g.adminid AS "adminID",
                       u.userid AS "userID",
                       u.username AS "userName",
                       u.userimage AS "userImage",
                       u.imageid AS "userImageID"
                       FROM group_members gm JOIN users u on gm.userid = u.userid JOIN groups g ON gm.group_id=g.group_id AND gm.group_id=$1`;
        const result = await db.query(query, [groupId]);
        if (result.rows.length > 0) {
            const adminId = result.rows.at(0).adminID;
            let adminName = null, adminImage = null, adminImageId = null;
            const formattedData = result.rows.map(row => {
                if (row.userID === adminId) {
                    adminName = row.userName;
                    adminImage = row.userImage;
                    adminImageId = row.userImageID;
                }
                return {
                    userId: row.userID,
                    userName: row.userName,
                    userImage: row.userImage,
                    userImageId: row.userImageID
                };
            });
            const responseData = {
                adminId: adminId,
                adminName: adminName,
                adminImage: adminImage,
                adminImageId: adminImageId,
                members: formattedData
            }
            return res.status(200).json({ status: true, message: "Data retreived successfully", data: responseData });
        }
        res.status(200).json({ status: true, message: "Data not found", data: [] });
    } catch (error) {
        console.error("Error ==>", error);
        res.status(500).json({ status: false, message: "Server error", data: [] });
    }
}



module.exports = { createGroup, getGroupByUserId, getGroupUsersByGroupId };
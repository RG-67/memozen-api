const db = require('../config/db');


const createNote = async (req, res) => {
    try {
        const { userid, title, content, tag} = req.body;
        const getNoteId = await db.query('SELECT prefix || middle || suffix AS note_id FROM note_id_sequence WHERE id = $1', [1]);
        const noteId = getNoteId.rows[0]?.note_id;
        await db.query('UPDATE note_id_sequence SET suffix = suffix + 1 WHERE id = $1', [1]);
        await db.query('INSERT INTO notes (noteid, userid, title, content, tag) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [noteId, userid, title, content, tag]);
        res.status(201).json({ status: true, message: "Note successfully created", data: {} });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}


const getNotes = async (req, res) => {
    try {
        const { userid } = req.query;
        const response = await db.query(`SELECT noteid, title, content, tag, to_Char(created_at::timestamp, 'HH12:MI AM') AS "createTime"
                                         FROM notes WHERE userid = $1 ORDER BY id asc`,
            [userid]);
        res.status(200).json({ status: true, message: "Notes successfully retrieved", data: response.rows });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: [] });
        console.error(e);
    }
}


const updateNote = async (req, res) => {
    try {
        const { userid, noteid } = req.query;
        const { title, content, tag } = req.body;
        const response = await db.query('UPDATE notes SET title = $1, content = $2, tag = $3, updated_at = LOCALTIMESTAMP WHERE noteid = $4 AND userid = $5 RETURNING *',
            [title, content, tag, noteid, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No note found', data: {} });
        }
        const result = await db.query(`Select row_to_json(t)::jsonb - 'id' - 'created_at' - 'updated_at' as result from (Select * from notes where noteid = $1 and userid = $2)t`, [noteid, userid]);
        res.status(200).json({ status: true, message: "Note successfully updated", data: result.rows[0].result});
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {} });
        console.error(e);
    }
}


const deleteNote = async (req, res) => {
    try {
        const { userid, noteid } = req.query;
        const response = await db.query('DELETE FROM notes WHERE noteid = $1 AND userid = $2 RETURNING *', [noteid, userid]);
        if (response.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'No note found', data: {} });
        }
        res.status(200).json({ status: true, message: "Note successfully deleted", data: {} });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error', data: {}});
        console.error(e);
    }
}



module.exports = { createNote, getNotes, updateNote, deleteNote };
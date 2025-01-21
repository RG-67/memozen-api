const express = require('express');
const upload = require('../config/multer').single('image');


const multerTest = express.Router();


multerTest.post('/test-upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(500).json({ status: false, message: "File upload failed", error: err.message });
        }
        console.log("Request file:", req.file);
        console.log("Request body:", req.body);
        if (!req.file) {
            return res.status(400).json({ status: false, message: "File not uploaded" });
        }
        res.status(200).json({ status: true, message: "File uploaded successfully", file: req.file });
    });
});


module.exports = multerTest;
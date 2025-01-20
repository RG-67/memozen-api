const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Upload directory path:", uploadDir);
} else {
    console.log("Directory exists:", fs.existsSync(uploadDir));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Multer destination called");
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        console.log("Multer filename called");
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


module.exports = upload;
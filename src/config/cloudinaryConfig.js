require('dotenv').config();
const cld = require('cloudinary').v2;

cld.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});


module.exports = cld;
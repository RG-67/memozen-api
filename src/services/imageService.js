const cldConfig = require('../config/cloudinaryConfig');



const uploadImage = async (imagePath) => {
    try {
        const result = await cldConfig.uploader.upload(imagePath, {
            folder: 'user_image',
        });
        return [result.secure_url, result.public_id];
    } catch (error) {
        throw error;
    }
};


module.exports = { uploadImage };
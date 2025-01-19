const cldConfig = require('../config/cloudinaryConfig');



const uploadImage = async (imagePath) => {
    try {
        console.log("Filepath ==> ", imagePath);
        const result = await cldConfig.uploader.upload(imagePath, {
            folder: 'user_image',
        });
        console.log(`CldResult ==> ${result}`);
        return result.secure_url;
    } catch (error) {
        console.error("CldResultError ==>", error);
        throw error;
    }
};


module.exports = { uploadImage };
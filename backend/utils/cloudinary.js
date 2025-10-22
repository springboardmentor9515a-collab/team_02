const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (filePath, options = {}) => {
  // File type/size validation can be done before or after this
  return await cloudinary.uploader.upload(filePath, {
    folder: "complaints",
    resource_type: "image",
    ...options,
  });
};

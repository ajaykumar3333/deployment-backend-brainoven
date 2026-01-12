// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for success stories
const storageStories = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "brainoven/success-stories",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Storage for gallery images
const storageGallery = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "brainoven/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

module.exports = { cloudinary, storageStories, storageGallery };
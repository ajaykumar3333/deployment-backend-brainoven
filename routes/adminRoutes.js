// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/adminController");
const multer = require("multer");
const { storageStories, storageGallery } = require("../config/cloudinary");

// Multer uploads for different purposes
const uploadStory = multer({
  storage: storageStories,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadGallery = multer({
  storage: storageGallery,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// courses
router.post("/courses", auth, ctrl.createCourse);
router.put("/courses/:id", auth, ctrl.updateCourse);
router.delete("/courses/:id", auth, ctrl.deleteCourse);

// success stories - use uploadStory
router.post("/successStories", auth, uploadStory.single("image"), ctrl.createStory);
router.put("/successStories/:id", auth, uploadStory.single("image"), ctrl.updateStory);
router.delete("/successStories/:id", auth, ctrl.deleteStory);

// ==================== GALLERY FOLDER ROUTES ====================
router.post("/gallery-folders", auth, ctrl.createGalleryFolder);
router.get("/gallery-folders", auth, ctrl.getGalleryFolders);
router.delete("/gallery-folders/:id", auth, ctrl.deleteGalleryFolder);

// Add images to folder - use uploadGallery
router.post("/gallery-folders/:folderId/images", auth, uploadGallery.array("images", 10), ctrl.addImageToFolder);
router.delete("/gallery-folders/:folderId/images/:imageId", auth, ctrl.deleteImageFromFolder);

// faqs
router.post("/faqs", auth, ctrl.createFaq);
router.put("/faqs/:id", auth, ctrl.updateFaq);
router.delete("/faqs/:id", auth, ctrl.deleteFaq);

module.exports = router;
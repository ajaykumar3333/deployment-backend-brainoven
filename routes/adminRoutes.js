// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/adminController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

// accept only image files and limit to 5MB
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
  },
});

// courses
router.post("/courses", auth, ctrl.createCourse);
router.put("/courses/:id", auth, ctrl.updateCourse);
router.delete("/courses/:id", auth, ctrl.deleteCourse);

// success stories — upload.single('image') handles file in field name "image"
router.post("/successStories", auth, upload.single("image"), ctrl.createStory);
router.put("/successStories/:id", auth, upload.single("image"), ctrl.updateStory);
router.delete("/successStories/:id", auth, ctrl.deleteStory);

// ==================== GALLERY FOLDER ROUTES ====================
// Create a new folder
router.post("/gallery-folders", auth, ctrl.createGalleryFolder);

// Get all folders (admin can use this too, but it's also in publicRoutes)
router.get("/gallery-folders", auth, ctrl.getGalleryFolders);

// Delete a folder
router.delete("/gallery-folders/:id", auth, ctrl.deleteGalleryFolder);

// Add image(s) to a folder - upload.array('images', 10) allows up to 10 images
router.post("/gallery-folders/:folderId/images", auth, upload.array("images", 10), ctrl.addImageToFolder);

// Delete a single image from a folder
router.delete("/gallery-folders/:folderId/images/:imageId", auth, ctrl.deleteImageFromFolder);

// faqs
router.post("/faqs", auth, ctrl.createFaq);
router.put("/faqs/:id", auth, ctrl.updateFaq);
router.delete("/faqs/:id", auth, ctrl.deleteFaq);

module.exports = router;
// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

// courses
router.post("/courses", auth, ctrl.createCourse);
router.put("/courses/:id", auth, ctrl.updateCourse);
router.delete("/courses/:id", auth, ctrl.deleteCourse);

// success stories
router.post("/successStories", auth, ctrl.createStory);
router.put("/successStories/:id", auth, ctrl.updateStory);
router.delete("/successStories/:id", auth, ctrl.deleteStory);

// gallery
router.post("/gallery", auth, ctrl.createGallery);
router.put("/gallery/:id", auth, ctrl.updateGallery);
router.delete("/gallery/:id", auth, ctrl.deleteGallery);

// faqs (admin CRUD)
router.post("/faqs", auth, ctrl.createFaq);
router.put("/faqs/:id", auth, ctrl.updateFaq);
router.delete("/faqs/:id", auth, ctrl.deleteFaq);

module.exports = router;

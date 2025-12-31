// routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const Faq = require("../models/Faq");
const GalleryFolder = require("../models/GalleryFolder");

// public fetch routes
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/successStories", async (req, res) => {
  try {
    const s = await SuccessStory.find().sort({ createdAt: -1 });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Gallery folders - public endpoint
router.get("/gallery-folders", async (req, res) => {
  try {
    const folders = await GalleryFolder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error("GET /gallery-folders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// public FAQs
router.get("/faqs", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    console.error("GET /faqs error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
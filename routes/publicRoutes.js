// routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const Faq = require("../models/Faq");
// const GalleryItem = require("../models/GalleryItem");
// const FaqItem = require("../models/FaqItem");

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

router.get("/gallery", async (req, res) => {
  try {
    const g = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(g);
  } catch (err) {
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

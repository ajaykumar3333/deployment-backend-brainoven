const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const GalleryItem = require("../models/GalleryItem");

// public fetch routes
router.get("/courses", async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json(course);
});

router.get("/successStories", async (req, res) => {
  const s = await SuccessStory.find().sort({ createdAt: -1 });
  res.json(s);
});

router.get("/gallery", async (req, res) => {
  const g = await GalleryItem.find().sort({ createdAt: -1 });
  res.json(g);
});

module.exports = router;

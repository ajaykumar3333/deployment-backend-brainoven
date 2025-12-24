// controllers/adminController.js
const Admin = require("../models/Admin");
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const GalleryItem = require("../models/GalleryItem");
const FaqItem = require("../models/FaqItem");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// --- Auth/login ---
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Courses CRUD
exports.createCourse = async (req, res) => {
  try {
    const c = new Course(req.body);
    await c.save();
    res.json(c);
  } catch (e) { res.status(500).json({ message: "Error creating course" }); }
};
exports.updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ message: "Error updating course" }); }
};
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: "Error deleting" }); }
};

// Success stories CRUD
exports.createStory = async (req, res) => {
  try { const s = new SuccessStory(req.body); await s.save(); res.json(s); } catch (e) { res.status(500).json({ message: "Error creating story" }); }
};
exports.updateStory = async (req, res) => {
  try { const updated = await SuccessStory.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (e) { res.status(500).json({ message: "Error updating story" }); }
};
exports.deleteStory = async (req, res) => {
  try { await SuccessStory.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({ message: "Error deleting story" }); }
};

// Gallery CRUD
exports.createGallery = async (req, res) => {
  try { const g = new GalleryItem(req.body); await g.save(); res.json(g); } catch (e) { res.status(500).json({ message: "Error creating gallery item" }); }
};
exports.updateGallery = async (req, res) => {
  try { const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (e) { res.status(500).json({ message: "Error updating gallery item" }); }
};
exports.deleteGallery = async (req, res) => {
  try { await GalleryItem.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({ message: "Error deleting gallery item" }); }
};

// FAQs CRUD
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ message: "Question and answer are required" });
    const faq = new FaqItem({ question, answer });
    await faq.save();
    res.json(faq);
  } catch (e) { res.status(500).json({ message: "Error creating FAQ" }); }
};

exports.updateFaq = async (req, res) => {
  try {
    const updated = await FaqItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ message: "Error updating FAQ" }); }
};

exports.deleteFaq = async (req, res) => {
  try {
    await FaqItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: "Error deleting FAQ" }); }
};

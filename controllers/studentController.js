// backend/controllers/studentController.js
const Student = require("../models/Student");

// Public: submit student enquiry
exports.submitForm = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = new Student({ name, email, phone });
    await student.save();

    return res.json({ message: "Submitted successfully" });
  } catch (err) {
    console.error("submitForm error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin-only: get all submissions
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (err) {
    console.error("getStudents error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

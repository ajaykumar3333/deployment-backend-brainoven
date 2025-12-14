const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  syllabus: { type: String, default: "" },
  duration: { type: String, default: "" },
  objectives: { type: String, default: "" },
  outcome: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", CourseSchema);

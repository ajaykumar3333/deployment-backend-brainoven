// models/SuccessStory.js
const mongoose = require("mongoose");

const SuccessStorySchema = new mongoose.Schema({
  studentName: String,
  title: String,
  content: String,
  imageUrl: String, // will store something like "/uploads/16342323_filename.jpg"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SuccessStory", SuccessStorySchema);

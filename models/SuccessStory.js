const mongoose = require("mongoose");

const SuccessStorySchema = new mongoose.Schema({
  studentName: String,
  title: String,
  content: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SuccessStory", SuccessStorySchema);

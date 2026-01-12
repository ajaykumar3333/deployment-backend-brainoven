// models/WhyChoose.js
const mongoose = require("mongoose");

const whyChooseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  order: { type: Number, default: 0 }, // for ordering items
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WhyChoose", whyChooseSchema);
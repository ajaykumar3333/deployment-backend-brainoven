const mongoose = require("mongoose");

const GalleryItemSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  caption: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GalleryItem", GalleryItemSchema);

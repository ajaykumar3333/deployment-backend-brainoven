// models/GalleryFolder.js
const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // stored path e.g. /uploads/xxx.jpg
  caption: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const GalleryFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: { type: [ImageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GalleryFolder", GalleryFolderSchema);
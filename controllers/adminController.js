// controllers/adminController.js
const Admin = require("../models/Admin");
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const GalleryFolder = require("../models/GalleryFolder");
const Faq = require("../models/Faq");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

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

// Courses CRUD (unchanged)
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

// --- Success stories CRUD (updated to handle uploads + file cleanup) ---
function getUploadPathFromUrl(url) {
  // handles cases like "/uploads/filename.jpg" or full URL "http://host/uploads/filename.jpg"
  if (!url) return null;
  try {
    const parsed = new URL(url, "http://localhost"); // base for relative paths
    return parsed.pathname; // e.g. /uploads/filename.jpg
  } catch (err) {
    return url;
  }
}

exports.createStory = async (req, res) => {
  try {
    const data = { ...req.body };

    // If a file was uploaded by multer, set imageUrl to a public path
    if (req.file && req.file.filename) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // fallback: accept direct url if provided (backwards compatibility)
      data.imageUrl = req.body.imageUrl;
    }

    const s = new SuccessStory(data);
    await s.save();
    res.json(s);
  } catch (e) {
    console.error("createStory error:", e);
    res.status(500).json({ message: "Error creating story" });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // If new file uploaded, set new imageUrl and remove old file if present
    if (req.file && req.file.filename) {
      updates.imageUrl = `/uploads/${req.file.filename}`;

      // remove old file if exists
      const existing = await SuccessStory.findById(id);
      if (existing && existing.imageUrl) {
        try {
          const oldPathname = getUploadPathFromUrl(existing.imageUrl);
          // only delete if it's inside /uploads
          if (oldPathname && oldPathname.startsWith("/uploads/")) {
            const filename = path.basename(oldPathname);
            const fullPath = path.join(__dirname, "..", "uploads", filename);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.warn("Could not delete old story image:", err.message);
        }
      }
    }

    const updated = await SuccessStory.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (e) {
    console.error("updateStory error:", e);
    res.status(500).json({ message: "Error updating story" });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await SuccessStory.findById(id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    // delete the image file if it's inside /uploads
    if (existing.imageUrl) {
      try {
        const oldPathname = getUploadPathFromUrl(existing.imageUrl);
        if (oldPathname && oldPathname.startsWith("/uploads/")) {
          const filename = path.basename(oldPathname);
          const fullPath = path.join(__dirname, "..", "uploads", filename);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn("Could not delete story image:", err.message);
      }
    }

    await SuccessStory.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("deleteStory error:", e);
    res.status(500).json({ message: "Error deleting story" });
  }
};

// ==================== GALLERY FOLDER CRUD ====================

// Create a new folder
exports.createGalleryFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Folder name is required" });

    const folder = new GalleryFolder({ name, images: [] });
    await folder.save();
    res.json(folder);
  } catch (e) {
    console.error("createGalleryFolder error:", e);
    res.status(500).json({ message: "Error creating folder" });
  }
};

// Get all folders
exports.getGalleryFolders = async (req, res) => {
  try {
    const folders = await GalleryFolder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (e) {
    console.error("getGalleryFolders error:", e);
    res.status(500).json({ message: "Error fetching folders" });
  }
};

// Delete a folder (and all its images)
exports.deleteGalleryFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await GalleryFolder.findById(id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // Delete all image files from disk
    folder.images.forEach(img => {
      try {
        const pathname = getUploadPathFromUrl(img.url);
        if (pathname && pathname.startsWith("/uploads/")) {
          const filename = path.basename(pathname);
          const fullPath = path.join(__dirname, "..", "uploads", filename);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn("Could not delete image file:", err.message);
      }
    });

    await GalleryFolder.findByIdAndDelete(id);
    res.json({ message: "Folder deleted" });
  } catch (e) {
    console.error("deleteGalleryFolder error:", e);
    res.status(500).json({ message: "Error deleting folder" });
  }
};

// Add image(s) to a folder
exports.addImageToFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await GalleryFolder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // req.files is an array when using upload.array('images')
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const caption = req.body.caption || "";

    // Add each uploaded file to the folder's images array
    req.files.forEach(file => {
      folder.images.push({
        url: `/uploads/${file.filename}`,
        caption,
        createdAt: new Date(),
      });
    });

    await folder.save();
    res.json(folder);
  } catch (e) {
    console.error("addImageToFolder error:", e);
    res.status(500).json({ message: "Error adding images" });
  }
};

// Delete a single image from a folder
exports.deleteImageFromFolder = async (req, res) => {
  try {
    const { folderId, imageId } = req.params;
    const folder = await GalleryFolder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const image = folder.images.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete the file from disk
    try {
      const pathname = getUploadPathFromUrl(image.url);
      if (pathname && pathname.startsWith("/uploads/")) {
        const filename = path.basename(pathname);
        const fullPath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("Could not delete image file:", err.message);
    }

    // Remove from array
    folder.images.pull(imageId);
    await folder.save();
    res.json(folder);
  } catch (e) {
    console.error("deleteImageFromFolder error:", e);
    res.status(500).json({ message: "Error deleting image" });
  }
};

// FAQs CRUD (unchanged)
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await Faq.create({ question, answer });
    return res.json(faq);
  } catch (err) {
    console.error("createFaq error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const updated = await Faq.findByIdAndUpdate(id, { question, answer }, { new: true });
    return res.json(updated);
  } catch (err) {
    console.error("updateFaq error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await Faq.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteFaq error:", err);
    return res.status(500).json({ error: err.message });
  }
};
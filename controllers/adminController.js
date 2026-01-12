// controllers/adminController.js
const Admin = require("../models/Admin");
const Course = require("../models/Course");
const SuccessStory = require("../models/SuccessStory");
const GalleryFolder = require("../models/GalleryFolder");
const Faq = require("../models/Faq");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { cloudinary } = require("../config/cloudinary");

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

// Helper to extract Cloudinary public_id from URL
function getCloudinaryPublicId(url) {
  if (!url) return null;
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload/v123456/' and remove file extension
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');
    return fullPath.replace(/\.[^/.]+$/, ''); // remove extension
  } catch (err) {
    return null;
  }
}

// --- Success stories CRUD ---
exports.createStory = async (req, res) => {
  try {
    const data = { ...req.body };

    // Cloudinary automatically uploads and req.file.path contains the URL
    if (req.file && req.file.path) {
      data.imageUrl = req.file.path; // Full Cloudinary URL
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

    // If new file uploaded
    if (req.file && req.file.path) {
      updates.imageUrl = req.file.path;

      // Delete old image from Cloudinary
      const existing = await SuccessStory.findById(id);
      if (existing && existing.imageUrl) {
        const publicId = getCloudinaryPublicId(existing.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.warn("Could not delete old image from Cloudinary:", err.message);
          }
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

    // Delete from Cloudinary
    if (existing.imageUrl) {
      const publicId = getCloudinaryPublicId(existing.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Could not delete image from Cloudinary:", err.message);
        }
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

exports.getGalleryFolders = async (req, res) => {
  try {
    const folders = await GalleryFolder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (e) {
    console.error("getGalleryFolders error:", e);
    res.status(500).json({ message: "Error fetching folders" });
  }
};

exports.deleteGalleryFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await GalleryFolder.findById(id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // Delete all images from Cloudinary
    for (const img of folder.images) {
      const publicId = getCloudinaryPublicId(img.url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Could not delete image from Cloudinary:", err.message);
        }
      }
    }

    await GalleryFolder.findByIdAndDelete(id);
    res.json({ message: "Folder deleted" });
  } catch (e) {
    console.error("deleteGalleryFolder error:", e);
    res.status(500).json({ message: "Error deleting folder" });
  }
};

exports.addImageToFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await GalleryFolder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const caption = req.body.caption || "";

    // Add each uploaded file to the folder
    req.files.forEach(file => {
      folder.images.push({
        url: file.path, // Cloudinary URL
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

exports.deleteImageFromFolder = async (req, res) => {
  try {
    const { folderId, imageId } = req.params;
    const folder = await GalleryFolder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const image = folder.images.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete from Cloudinary
    const publicId = getCloudinaryPublicId(image.url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Could not delete image from Cloudinary:", err.message);
      }
    }

    folder.images.pull(imageId);
    await folder.save();
    res.json(folder);
  } catch (e) {
    console.error("deleteImageFromFolder error:", e);
    res.status(500).json({ message: "Error deleting image" });
  }
};

// FAQs CRUD
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
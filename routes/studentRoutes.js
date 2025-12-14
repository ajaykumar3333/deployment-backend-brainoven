// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");
const auth = require("../middleware/auth");

// Public form submission
router.post("/submit", ctrl.submitForm);

// Admin-only: view all submissions
router.get("/all", auth, ctrl.getStudents);

module.exports = router;

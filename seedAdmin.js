require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");

(async () => {
  try {
    await connectDB();
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin already exists. username=admin");
      process.exit(0);
    }
    const hashed = await bcrypt.hash("admin123", 10);
    await Admin.create({ username: "admin", password: hashed });
    console.log("Seeded admin => username: admin password: admin123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

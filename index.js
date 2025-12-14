require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api", require("./routes/publicRoutes"));
app.use("/api/admin", require("./routes/authRoutes"));
app.use("/api/admin/content", require("./routes/adminRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

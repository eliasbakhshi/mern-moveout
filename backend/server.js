import "./utils/env.js";
import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import mainRouter from "./routes/main.js";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import cors from "cors";
import "./utils/env.js";
import bodyParser from "body-parser";
import updateLastActive from "./middlewares/updateLastActive.js";

// Create __dirname equivalent
const __dirname = path.resolve();

// Utils
const port = process.env.PORT || 5000;
const app = express();

// Check if the img directory exists, if not, create it
const uploadsPath = path.join(__dirname, process.env.UPLOADS_PATH);
const deletedUploadsPath = path.join(__dirname, process.env.DELETED_UPLOADS_PATH);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
if (!fs.existsSync(deletedUploadsPath)) {
  fs.mkdirSync(deletedUploadsPath);
}

app.use("/uploads", express.static(uploadsPath));
app.use("/deleted-uploads", express.static(deletedUploadsPath));

app.use(bodyParser.urlencoded({ extended: false }));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.BASE_URL || "*", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies to be sent with requests
  }),
);
// Update last active middleware
app.use(updateLastActive);

// Routes
app.use("", mainRouter);
app.use("", userRouter);
app.use("/admin", adminRouter);
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();

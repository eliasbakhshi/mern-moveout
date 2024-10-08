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
import multer from "multer";
import "./utils/env.js";
import bodyParser from "body-parser";
import ShortUniqueId from "short-unique-id";
import updateLastActive from "./middlewares/updateLastActive.js";

// Create __dirname equivalent
const __dirname = path.resolve();

// Utils
const port = process.env.PORT || 5000;
const app = express();
const uid = new ShortUniqueId({ length: 10 });

// Check if the img directory exists, if not, create it
const uploadDir = process.env.UPLOADS_PATH || "uploads";
const imgProducts = path.join(__dirname, process.env.UPLOADS_PATH);

if (!fs.existsSync(imgProducts)) {
  fs.mkdirSync(imgProducts);
}

app.use("/uploads", express.static(imgProducts));

// Multer storage configuration
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgProducts);
  },
  filename: (req, file, cb) => {
    // TODO: Choose a file size limit with .env file

    // const randomNum = Math.floor(Math.random() * 9000) + 1000;
    let newName = uid.rnd() + "-" + file.originalname;
    newName = newName.replace(/\s/g, "-");
    cb(null, newName);
  },
});

// Filter the files that are allowed to be uploaded
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|mp3|wav/;
  const mimeTypes =
    /image\/jpe?g|image\/png|image\/webp|audio\/mpeg|audio\/wav/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  if (filetypes.test(extname) && mimeTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

// Multer middleware.
app.use(
  multer({
    storage: fileStorage,
    fileFilter,
    limits: { fileSize: process.env.MAX_UPLOAD_SIZE },
  }).single("media"),
);

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

import multer from "multer";
import path from "path";
import fs from "fs";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

// Check if the img directory exists, if not, create it
const __dirname = path.resolve();
const uploadDir = process.env.UPLOADS_PATH || "uploads";
const imgProducts = path.join(__dirname, process.env.UPLOADS_PATH);

if (!fs.existsSync(imgProducts)) {
  fs.mkdirSync(imgProducts);
}

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

// Multer middleware
const media = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: process.env.MAX_UPLOAD_SIZE },
}).single("image");

export default media;

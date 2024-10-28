import multer from "multer";
import path from "path";
import ShortUniqueId from "short-unique-id";
import User from "../models/User.js";

const uid = new ShortUniqueId({ length: 4 });

// Check if the img directory exists, if not, create it
const __dirname = path.resolve();
const imgProducts = path.join(__dirname, process.env.UPLOADS_PATH);

// Multer storage configuration
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgProducts);
  },
  filename: (req, file, cb) => {
    // Limit the size of the file to 2 MB
    if (file.size > process.env.MAX_UPLOAD_SIZE) {
      return cb(
        new Error(
          `File is too large. Max size is ${process.env.MAX_UPLOAD_SIZE / 1000000}`,
        ),
        false,
      );
    }

    let newName = req.user._id + "-" + uid.rnd() + "-" + file.originalname;
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
const getMedia = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: process.env.MAX_UPLOAD_SIZE },
  // TODO: check if the limited size is applied
}).single("media");

export default getMedia;

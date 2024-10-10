"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var uid = new _shortUniqueId["default"]({
  length: 10
}); // Check if the img directory exists, if not, create it

var _dirname = _path["default"].resolve();

var uploadDir = process.env.UPLOADS_PATH || "uploads";

var imgProducts = _path["default"].join(_dirname, process.env.UPLOADS_PATH);

if (!_fs["default"].existsSync(imgProducts)) {
  _fs["default"].mkdirSync(imgProducts);
} // Multer storage configuration


var fileStorage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, imgProducts);
  },
  filename: function filename(req, file, cb) {
    // TODO: Choose a file size limit with .env file
    // const randomNum = Math.floor(Math.random() * 9000) + 1000;
    var newName = uid.rnd() + "-" + file.originalname;
    newName = newName.replace(/\s/g, "-");
    cb(null, newName);
  }
}); // Filter the files that are allowed to be uploaded


var fileFilter = function fileFilter(req, file, cb) {
  var filetypes = /jpe?g|png|webp|mp3|wav/;
  var mimeTypes = /image\/jpe?g|image\/png|image\/webp|audio\/mpeg|audio\/wav/;

  var extname = _path["default"].extname(file.originalname).toLowerCase();

  var mimetype = file.mimetype.toLowerCase();

  if (filetypes.test(extname) && mimeTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
}; // Multer middleware


var media = (0, _multer["default"])({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_UPLOAD_SIZE
  }
}).single("image");
var _default = media;
exports["default"] = _default;
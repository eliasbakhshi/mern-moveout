"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _path = _interopRequireDefault(require("path"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

var _User = _interopRequireDefault(require("../models/User.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var uid = new _shortUniqueId["default"]({
  length: 4
}); // Check if the img directory exists, if not, create it

var _dirname = _path["default"].resolve();

var imgProducts = _path["default"].join(_dirname, process.env.UPLOADS_PATH); // Multer storage configuration


var fileStorage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, imgProducts);
  },
  filename: function filename(req, file, cb) {
    // Limit the size of the file to 2 MB
    if (file.size > process.env.MAX_UPLOAD_SIZE) {
      return cb(new Error("File is too large. Max size is ".concat(process.env.MAX_UPLOAD_SIZE / 1000000)), false);
    }

    var newName = req.user._id + "-" + uid.rnd() + "-" + file.originalname;
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


var getMedia = (0, _multer["default"])({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_UPLOAD_SIZE
  } // TODO: check if the limited size is applied

}).single("media");
var _default = getMedia;
exports["default"] = _default;
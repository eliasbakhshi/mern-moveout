"use strict";

require("./utils/env.js");

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _express = _interopRequireDefault(require("express"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _main = _interopRequireDefault(require("./routes/main.js"));

var _user = _interopRequireDefault(require("./routes/user.js"));

var _admin = _interopRequireDefault(require("./routes/admin.js"));

var _cors = _interopRequireDefault(require("cors"));

var _multer = _interopRequireDefault(require("multer"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

var _updateLastActive = _interopRequireDefault(require("./middlewares/updateLastActive.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Create __dirname equivalent
var _dirname = _path["default"].resolve(); // Utils


var port = process.env.PORT || 5000;
var app = (0, _express["default"])();
var uid = new _shortUniqueId["default"]({
  length: 10
}); // Check if the img directory exists, if not, create it

var uploadDir = process.env.UPLOADS_PATH || "uploads";

var imgProducts = _path["default"].join(_dirname, process.env.UPLOADS_PATH);

if (!_fs["default"].existsSync(imgProducts)) {
  _fs["default"].mkdirSync(imgProducts);
}

app.use("/uploads", _express["default"]["static"](imgProducts)); // Multer storage configuration

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
};

app.set("view engine", "ejs");
app.use(_bodyParser["default"].urlencoded({
  extended: false
})); // Multer middleware.

app.use((0, _multer["default"])({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_UPLOAD_SIZE
  }
}).single("media")); // Middlewares

app.use(_express["default"].urlencoded({
  extended: true
}));
app.use(_express["default"].json());
app.use((0, _cookieParser["default"])());
app.use((0, _cors["default"])({
  origin: process.env.BASE_URL || "*",
  // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  // Allow these HTTP methods
  credentials: true // Allow cookies to be sent with requests

})); // Update last active middleware

app.use(_updateLastActive["default"]); // Routes

app.use("", _main["default"]);
app.use("", _user["default"]);
app.use("/admin", _admin["default"]);
app.use(function (req, res) {
  res.status(404).json({
    error: "Route not found."
  });
}); // Error handling middleware

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error"
  });
}); // Start server

var startServer = function startServer() {
  return regeneratorRuntime.async(function startServer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_mongoose["default"].connect(process.env.MONGO_URI));

        case 3:
          app.listen(port, function () {
            console.log("Server is running on port ".concat(port));
          });
          _context.next = 9;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

startServer();